package com.chat.webflux.dto;

import com.chat.webflux.message.ChatMessage;
import com.chat.webflux.user.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

// 채팅 메시지 데이터를 프론트엔드로 전송하기 위한 DTO 클래스
@Getter
public class ChatMessageDto {
    // ChatMessage 엔티티에서 복사되는 필드
    private final String id;
    private final String roomId;
    private final String sender;
    private final String senderNickname;
    private final String senderProfileUrl;
    private final String content;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private final Instant createdAt;
    private final Map<String, String> translations;
    private final ChatMessage.MessageType messageType;
    private final String fileUrl;
    private final boolean edited;
    private final boolean deleted;
    private final Set<String> readBy;
    private int unreadCount;
    private final String replyToMessageId;
    private ChatMessageDto repliedMessageInfo;

    // 1. 메인 생성자 (User 객체를 받음)
    public ChatMessageDto(ChatMessage message, User sender) {
        this.id = message.getId();
        this.roomId = message.getRoomId();
        this.sender = message.getSender();
        this.senderNickname = sender.getNickname();
        this.senderProfileUrl = sender.getProfilePictureUrl();
        this.content = message.getContent();
        this.createdAt = message.getCreatedAt();
        this.messageType = message.getMessageType();
        this.fileUrl = message.getFileUrl();
        this.edited = message.isEdited();
        this.deleted = message.isDeleted();
        this.readBy = message.getReadBy();
        this.replyToMessageId = message.getReplyToMessageId();
        this.translations = (message.getTranslations() != null) ? message.getTranslations() : Collections.emptyMap();
    }

    // 2. 비상용 생성자 (String을 받음)
    public ChatMessageDto(ChatMessage message, String fallbackSender) {
        this.id = message.getId();
        this.roomId = message.getRoomId();
        this.sender = message.getSender();
        this.senderNickname = fallbackSender;
        this.senderProfileUrl = null;
        this.content = message.getContent();
        this.createdAt = message.getCreatedAt();
        this.messageType = message.getMessageType();
        this.fileUrl = message.getFileUrl();
        this.edited = message.isEdited();
        this.deleted = message.isDeleted();
        this.readBy = message.getReadBy();
        this.replyToMessageId = message.getReplyToMessageId();
        this.translations = (message.getTranslations() != null) ? message.getTranslations() : Collections.emptyMap();
    }

    // 답장 메시지의 원본 메시지 DTO를 설정
    public void setRepliedMessageInfo(ChatMessageDto repliedMessageInfo) {
        this.repliedMessageInfo = repliedMessageInfo;
    }

    // 채팅방의 총 멤버 수를 기준으로 "안 읽은 수"를 계산하여 설정
    public void setUnreadCount(int totalMembers) {
        if (this.readBy != null) {
            this.unreadCount = totalMembers - this.readBy.size();
            if (this.unreadCount < 0) this.unreadCount = 0;
        } else {
            this.unreadCount = totalMembers;
        }
    }
}