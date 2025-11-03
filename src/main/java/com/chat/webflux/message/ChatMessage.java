package com.chat.webflux.message;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

// MongoDB의 "chat_messages" 컬렉션에 매핑되는 엔티티 클래스
// 모든 채팅 메시지(텍스트, 파일, 이미지)의 원본 데이터를 저장
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "chat_messages")
public class ChatMessage {

    //메시지 유형을 구분하기 위한 열거형
    public enum MessageType {
        TEXT, FILE, IMAGE
    }

    //메시지의 고유 ID (MongoDB의 기본 키 '_id' 필드에 매핑)
    @Id
    private String id;
    private String roomId;
    private String sender;
    private String content;
    private Instant createdAt;
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
        this.createdAt = Instant.now();
        this.readBy.add(sender);
    }

    // 파일/이미지 메시지용 생성자
    public ChatMessage(String roomId, String sender, String content, String fileUrl, MessageType messageType) {
        this.roomId = roomId;
        this.sender = sender;
        this.content = content;
        this.fileUrl = fileUrl;
        this.messageType = messageType;
        this.createdAt = Instant.now();
        this.readBy.add(sender);
    }
}