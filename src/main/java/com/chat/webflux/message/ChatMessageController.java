package com.chat.webflux.message;

import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.dto.ChatMessageDto;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

// 채팅 메시지 조회/검색 관련 HTTP API 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;

    // 특정 채팅방의 "모든 메시지"를 오래된 순으로 조회
    @GetMapping("/{roomId}/messages")
    public Flux<ChatMessageDto> getMessagesByRoom(@PathVariable String roomId,
                                                  @RequestHeader("X-Username") String encodedUsername) {
        // 1.헤더로 받은 사용자 ID를 디코딩
        final String username;
        try {
            username = URLDecoder.decode(encodedUsername, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return Flux.error(new IllegalArgumentException("Invalid username encoding"));
        }

        // 2. (DB) 채팅방 정보를 조회
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 채팅방입니다.")))
                .flatMapMany(chatRoom -> {
                    // 3.요청한 'username'이 채팅방 멤버인지 확인
                    if (chatRoom.getMembers() == null || !chatRoom.getMembers().contains(username)) {
                        return Flux.error(new SecurityException("메시지를 조회할 권한이 없습니다."));
                    }

                    // 4. 안 읽은 수 계산을 위해 총 멤버 수를 미리 가져옴
                    int totalMembers = chatRoom.getMembers().size();

                    // 5. (DB) 이 방의 "모든 메시지"를 리스트로 한 번에 가져옴
                    return chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId)
                            .collectList()
                            .flatMapMany(messages -> {

                                // 6. (메모리) 답장이 필요한 "원본 메시지 ID" 목록을 중복 없이 추출
                                List<String> replyIds = messages.stream()
                                        .map(ChatMessage::getReplyToMessageId)
                                        .filter(id -> id != null && !id.isEmpty())
                                        .distinct()
                                        .toList();

                                // 7. (DB) "원본 메시지" 정보들을 단 한 번의 쿼리로 조회
                                Mono<Map<String, ChatMessage>> repliedMessagesMapMono =
                                        chatMessageRepository.findAllById(replyIds)
                                                .collectMap(ChatMessage::getId, Function.identity());

                                // 8. (메모리) 메시지를 보낸 "사용자 ID" 목록을 중복 없이 추출
                                List<String> senderIds = messages.stream().map(ChatMessage::getSender).distinct().toList();

                                // 9. (DB) "사용자" 정보들을 단 한 번의 쿼리로 조회
                                Mono<Map<String, User>> usersMapMono = userRepository.findByUsernameIn(senderIds)
                                        .collectMap(User::getUsername, Function.identity());

                                // 10. 모든 데이터를 조합하여 최종 DTO Flux를 생성합니다.
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

                                                // 답장 정보가 있다면 원본 메시지 DTO를 만들어 설정
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

    // 검색 API
    @GetMapping("/{roomId}/messages/search")
    public Flux<ChatMessageDto> searchMessages(
            @PathVariable String roomId,
            @RequestParam String keyword) {

        return chatMessageRepository.findByRoomIdAndSearchKeyword(roomId, keyword)
                .collectList() // 검색 결과를 "한 번에" 리스트로 모음
                .flatMapMany(messages -> {
                    if (messages.isEmpty()) {
                        return Flux.empty();
                    }
                    // 필요한 유저 ID만 "중복 없이" 추출
                    List<String> senderIds = messages.stream()
                            .map(ChatMessage::getSender)
                            .distinct()
                            .toList();

                    // 유저 정보를 "한 번에" 맵으로 가져옴
                    Mono<Map<String, User>> usersMapMono = userRepository.findByUsernameIn(senderIds)
                            .collectMap(User::getUsername, Function.identity());

                    // "DB 조회 없이" 메모리에서 조합
                    return usersMapMono
                            .flatMapMany(usersMap -> {
                                List<ChatMessageDto> dtos = messages.stream().map(msg -> {
                                    User sender = usersMap.get(msg.getSender());
                                    return (sender != null) ?
                                            new ChatMessageDto(msg, sender) :
                                            new ChatMessageDto(msg, msg.getSender());
                                }).toList();
                                return Flux.fromIterable(dtos);
                            });
                });
    }

    //갤러리 API
    @GetMapping("/{roomId}/gallery")
    public Flux<ChatMessageDto> getRoomGallery(@PathVariable String roomId) {

        return chatMessageRepository.findByRoomIdAndFileUrlIsNotNullOrderByCreatedAtDesc(roomId)
                .collectList() //갤러리 결과를 "한 번에" 리스트로 모음
                .flatMapMany(messages -> {
                    if (messages.isEmpty()) {
                        return Flux.empty();
                    }
                    //필요한 유저 ID만 "중복 없이" 추출
                    List<String> senderIds = messages.stream()
                            .map(ChatMessage::getSender)
                            .distinct()
                            .toList();

                    //유저 정보를 "한 번에" 맵으로 가져옴
                    Mono<Map<String, User>> usersMapMono = userRepository.findByUsernameIn(senderIds)
                            .collectMap(User::getUsername, Function.identity());

                    //"DB 조회 없이" 메모리에서 조합
                    return usersMapMono
                            .flatMapMany(usersMap -> {
                                List<ChatMessageDto> dtos = messages.stream().map(msg -> {
                                    User sender = usersMap.get(msg.getSender());
                                    return (sender != null) ?
                                            new ChatMessageDto(msg, sender) :
                                            new ChatMessageDto(msg, msg.getSender());
                                }).toList();
                                return Flux.fromIterable(dtos);
                            });
                });
    }
}