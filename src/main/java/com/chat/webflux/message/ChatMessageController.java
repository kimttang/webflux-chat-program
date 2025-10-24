package com.chat.webflux.message;

import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.dto.ChatMessageDto;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import com.chat.webflux.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ChatRoomRepository chatRoomRepository;

    @GetMapping("/{roomId}/messages")
    public Flux<ChatMessageDto> getMessagesByRoom(@PathVariable String roomId,
                                                  @RequestHeader("X-Username") String encodedUsername) { // [2. 변수명 변경]

        // [3. 디코딩 로직 추가]
        final String username;
        try {
            // UTF-8을 사용해 한글/특수문자를 원래대로 복원합니다.
            username = URLDecoder.decode(encodedUsername, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return Flux.error(new IllegalArgumentException("Invalid username encoding"));
        }
        // [여기까지 추가]


        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 채팅방입니다.")))
                .flatMapMany(chatRoom -> {
                    // [4. 디코딩된 'username' 변수를 사용하도록 수정]
                    if (chatRoom.getMembers() == null || !chatRoom.getMembers().contains(username)) {
                        return Flux.error(new SecurityException("메시지를 조회할 권한이 없습니다."));
                    }

                    int totalMembers = chatRoom.getMembers().size();

                    // --- (이하는 제공해주신 기존 로직과 동일) ---
                    return chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId)
                            .collectList() // 1. 먼저 모든 메시지를 리스트로 가져옵니다.
                            .flatMapMany(messages -> {
                                // 2. 답장이 필요한 원본 메시지 ID 목록을 추출합니다.
                                List<String> replyIds = messages.stream()
                                        .map(ChatMessage::getReplyToMessageId)
                                        .filter(id -> id != null && !id.isEmpty())
                                        .distinct()
                                        .toList();

                                // 3. 원본 메시지들을 한 번의 쿼리로 모두 조회합니다.
                                Mono<Map<String, ChatMessage>> repliedMessagesMapMono =
                                        chatMessageRepository.findAllById(replyIds)
                                                .collectMap(ChatMessage::getId, Function.identity());

                                // 4. 사용자 정보도 한 번의 쿼리로 모두 조회합니다.
                                List<String> senderIds = messages.stream().map(ChatMessage::getSender).distinct().toList();
                                Mono<Map<String, User>> usersMapMono = userRepository.findByUsernameIn(senderIds)
                                        .collectMap(User::getUsername, Function.identity());

                                // 5. 모든 데이터를 조합하여 최종 DTO Flux를 생성합니다.
                                return Mono.zip(repliedMessagesMapMono, usersMapMono)
                                        .flatMapMany(tuple -> {
                                            Map<String, ChatMessage> repliedMessagesMap = tuple.getT1();
                                            Map<String, User> usersMap = tuple.getT2();

                                            List<ChatMessageDto> dtos = messages.stream().map(msg -> {
                                                User sender = usersMap.get(msg.getSender());
                                                ChatMessageDto dto = (sender != null) ?
                                                        new ChatMessageDto(msg, sender) :
                                                        new ChatMessageDto(msg, msg.getSender());

                                                dto.setUnreadCount(totalMembers);

                                                // 답장 정보가 있다면 원본 메시지 DTO를 만들어 설정합니다.
                                                if (msg.getReplyToMessageId() != null) {
                                                    ChatMessage repliedMsg = repliedMessagesMap.get(msg.getReplyToMessageId());
                                                    if (repliedMsg != null) {
                                                        User repliedSender = usersMap.get(repliedMsg.getSender());
                                                        ChatMessageDto repliedDto = (repliedSender != null) ?
                                                                new ChatMessageDto(repliedMsg, repliedSender) :
                                                                new ChatMessageDto(repliedMsg, repliedMsg.getSender());
                                                        dto.setRepliedMessageInfo(repliedDto);
                                                    }
                                                }
                                                return dto;
                                            }).toList();
                                            return Flux.fromIterable(dtos);
                                        });
                            });
                });
    }
    @GetMapping("/{roomId}/messages/search")
    public Flux<ChatMessageDto> searchMessages(
            @PathVariable String roomId,
            @RequestParam String keyword) {

        return chatMessageRepository.findByRoomIdAndSearchKeyword(roomId, keyword)
                .flatMap(message ->
                        userService.findByUsername(message.getSender())
                                .map(user -> new ChatMessageDto(message, user))
                                .defaultIfEmpty(new ChatMessageDto(message, message.getSender()))
                );
    }

    // 특정 채팅방의 모든 파일/이미지 목록 (갤러리) 조회
    @GetMapping("/{roomId}/gallery")
    public Flux<ChatMessageDto> getRoomGallery(@PathVariable String roomId) {

        // 1. 1단계에서 만든 쿼리 메서드 호출
        return chatMessageRepository.findByRoomIdAndFileUrlIsNotNullOrderByCreatedAtDesc(roomId)
                .flatMap(message ->
                        // 2. 메시지 DTO로 변환 (기존 검색 로직과 동일)
                        userService.findByUsername(message.getSender())
                                .map(user -> new ChatMessageDto(message, user))
                                .defaultIfEmpty(new ChatMessageDto(message, message.getSender()))
                );
    }
}