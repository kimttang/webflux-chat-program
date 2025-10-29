package com.chat.webflux.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.util.Set;

// WebSocket을 통해 서버가 클라이언트로 메시지를 전송할 때 사용하는 DTO
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OutgoingMessage {
    private final String type;
    private final String sender;
    private final String content;
    private final ChatMessageDto messagePayload;
    private final String originalMessageId;

    // 읽음 확인 업데이트를 위한 필드들
    private final String messageId;
    private final Set<String> readBy;
    private final Integer unreadCount;

    // 새로운 필드를 포함하도록 private 생성자 수정
    private OutgoingMessage(String type, String sender, String content, ChatMessageDto messagePayload, String originalMessageId, String messageId, Set<String> readBy, Integer unreadCount) {
        this.type = type;
        this.sender = sender;
        this.content = content;
        this.messagePayload = messagePayload;
        this.originalMessageId = originalMessageId;
        this.messageId = messageId;
        this.readBy = readBy;
        this.unreadCount = unreadCount;
    }

    // 기존 정적 팩토리 메서드들 (호출 시 null을 전달하도록 수정)
    public static OutgoingMessage forEvent(String type, String sender, String content) {
        return new OutgoingMessage(type, sender, content, null, null, null, null, null);
    }
    public static OutgoingMessage forChatMessage(ChatMessageDto chatMessageDto) {
        return new OutgoingMessage("MESSAGE", chatMessageDto.getSender(), null, chatMessageDto, null, null, null, null);
    }
    public static OutgoingMessage forTranslateResult(String sender, String translatedContent, String originalMessageId) {
        return new OutgoingMessage("TRANSLATE_RESULT", sender, translatedContent, null, originalMessageId, null, null, null);
    }

    // 읽음 확인 업데이트 메시지를 생성하는 새로운 메서드
    public static OutgoingMessage forReadReceiptUpdate(String messageId, Set<String> readBy, int unreadCount) {
        return new OutgoingMessage("READ_RECEIPT_UPDATE", null, null, null, null, messageId, readBy, unreadCount);
    }
    public static OutgoingMessage forMessageUpdate(ChatMessageDto updatedDto) {
        return new OutgoingMessage(
                "MESSAGE_UPDATE", // type
                null,             // sender
                null,             // content
                updatedDto,       // messagePayload (가장 중요한 데이터)
                null,             // originalMessageId
                null,             // messageId
                null,             // readBy
                null              // unreadCount
        );
    }
}