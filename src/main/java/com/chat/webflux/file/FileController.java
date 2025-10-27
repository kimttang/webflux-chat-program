package com.chat.webflux.file;

import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.chatroom.ChatRoomService;
import com.chat.webflux.dto.ChatMessageDto;
import com.chat.webflux.dto.OutgoingMessage;
import com.chat.webflux.handler.ChatWebSocketHandler;
import com.chat.webflux.message.ChatMessage;
import com.chat.webflux.message.ChatMessageRepository;
import com.chat.webflux.unread.UnreadCountService;
import com.chat.webflux.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FileController {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ChatMessageRepository chatMessageRepository;

    // 닉네임을 찾기 위해 UserRepository 의존성 주입
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UnreadCountService unreadCountService;
    private final ChatRoomService chatRoomService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostMapping("/upload/{roomId}")
    public Mono<Void> uploadFile(@PathVariable String roomId,
                                 @RequestHeader("sender") String encodedSender,
                                 @RequestPart("file") Mono<FilePart> filePartMono) {

        String sender;
        try {
            sender = URLDecoder.decode(encodedSender, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return Mono.error(new IllegalArgumentException("Invalid sender encoding"));
        }

        return filePartMono
                .flatMap(filePart -> {
                    String originalFilename = filePart.filename();
                    String uuidFileName = UUID.randomUUID() + "_" + originalFilename;
                    Path path = Paths.get(uploadDir).resolve(uuidFileName);

                    try {
                        Files.createDirectories(path.getParent());
                    } catch (IOException e) {
                        return Mono.error(new RuntimeException("Upload directory creation failed.", e));
                    }

                    Mono<Void> saveFileMono = filePart.transferTo(path);
                    ChatMessage.MessageType messageType = isImage(originalFilename) ? ChatMessage.MessageType.IMAGE : ChatMessage.MessageType.FILE;
                    String fileUrl = "/uploads/" + uuidFileName;
                    ChatMessage chatMessage = new ChatMessage(roomId, sender, originalFilename, fileUrl, messageType);

                    // 메시지를 저장한 후, 닉네임을 찾아 DTO를 만들어 전송하도록 로직 변경
                    return saveFileMono
                            .then(chatMessageRepository.save(chatMessage))
                            .flatMap(savedMessage ->
                                    userRepository.findByUsername(savedMessage.getSender())
                                            .map(user -> new ChatMessageDto(savedMessage, user))
                            )
                            .flatMap(chatMessageDto -> {
                                // 1. (웹소켓) 채팅방 내부에는 메시지를 즉시 방송
                                OutgoingMessage outgoingMessage = OutgoingMessage.forChatMessage(chatMessageDto);
                                chatWebSocketHandler.broadcastMessage(roomId, outgoingMessage);

                                // 2. (SSE) 채팅방 "목록" 갱신 로직
                                return chatRoomRepository.findById(roomId)
                                        .flatMap(chatRoom -> {

                                            //  "안 읽음 숫자 1 증가" 작업을 Mono<Void>로 정의
                                            Mono<Void> incrementMono = Flux.fromIterable(chatRoom.getMembers())
                                                    .filter(member -> !member.equals(sender) && !chatWebSocketHandler.isUserPresent(roomId, member))
                                                    .flatMap(member -> unreadCountService.incrementUnreadCount(member, roomId)) // (A) DB Write
                                                    .then(); // <-- 모든 DB 저장이 끝날 때까지 기다림

                                            // "안 읽음" 저장이 "모두" 완료된 "후에"(.then) SSE 갱신 실행
                                            return incrementMono
                                                    .then(Mono.fromRunnable(() -> {
                                                        log.info("[SSE Broadcast] 파일 업로드로 인한 목록 갱신 (Room: {})", chatRoom.getId());
                                                        // 이 시점엔 DB Write가 완료되었으므로, broadcast가 정확한 숫자를 읽음
                                                        chatRoomService.broadcastToAllMembers(chatRoom);
                                                    }));
                                        })
                                        .then(); // Mono<Void> 반환
                            })
                            .then();
                })
                .doOnError(e -> log.error("File upload process failed", e))
                .then();
    }

    private boolean isImage(String filename) {
        if (filename == null) return false;
        String lowerCaseFilename = filename.toLowerCase();
        return lowerCaseFilename.endsWith(".png") || lowerCaseFilename.endsWith(".jpg") ||
                lowerCaseFilename.endsWith(".jpeg") || lowerCaseFilename.endsWith(".gif") ||
                lowerCaseFilename.endsWith(".bmp");
    }
}