package com.chat.webflux.message;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "chat_messages")
public class ChatMessage {

    public enum MessageType {
        TEXT, FILE, IMAGE
    }

    @Id
    private String id;

    private String roomId;
    private String sender;
    private String content;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    private MessageType messageType;
    private String fileUrl;
    private boolean edited = false;
    private boolean deleted = false;
    private Set<String> readBy = new HashSet<>();
    private String replyToMessageId;
    private Map<String, String> translations = new HashMap<>();

    // 텍스트 메시지용 생성자
    public ChatMessage(String roomId, String sender, String content) {
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
        this.messageType = MessageType.TEXT;
        this.createdAt = LocalDateTime.now();
        this.readBy.add(sender);
    }

    // 파일/이미지 메시지용 생성자
    public ChatMessage(String roomId, String sender, String content, String fileUrl, MessageType messageType) {
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
        this.fileUrl = fileUrl;
        this.messageType = messageType;
        this.createdAt = LocalDateTime.now();
        this.readBy.add(sender);
    }
}