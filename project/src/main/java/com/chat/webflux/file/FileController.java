package com.chat.webflux.file;

import com.chat.webflux.dto.ChatMessageDto; // ChatMessageDto import 추가
import com.chat.webflux.dto.OutgoingMessage;
import com.chat.webflux.handler.ChatWebSocketHandler;
import com.chat.webflux.message.ChatMessage;
import com.chat.webflux.message.ChatMessageRepository;
import com.chat.webflux.user.UserRepository; // UserRepository import 추가
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
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
                            .doOnSuccess(chatMessageDto -> {
                                OutgoingMessage outgoingMessage = OutgoingMessage.forChatMessage(chatMessageDto);
                                chatWebSocketHandler.broadcastMessage(roomId, outgoingMessage);
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