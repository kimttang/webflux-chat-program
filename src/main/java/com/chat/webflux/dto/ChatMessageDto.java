package com.chat.webflux.dto;

import com.chat.webflux.message.ChatMessage;
import com.chat.webflux.user.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Set;

@Getter
public class ChatMessageDto {
    private final String id;
    private final String roomId;
    private final String sender;
    private final String senderNickname;
    private final String senderProfileUrl;
    private final String content;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime createdAt;
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
    // - 사용자를 성공적으로 찾았을 때 사용됩니다.
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
        this.translations = (message.getTranslations() != null) ? message.getTranslations() : Collections.emptyMap();
        this.replyToMessageId = message.getReplyToMessageId();
    }

    // 2. [핵심] 비상용 생성자 (String을 받음)
    // - DB에서 사용자를 찾지 못했을 때(defaultIfEmpty) 사용됩니다.
    public ChatMessageDto(ChatMessage message, String fallbackSender) {
        this.id = message.getId();
        this.roomId = message.getRoomId();
        this.sender = message.getSender();
        this.senderNickname = fallbackSender; // 닉네임은 일단 username으로 대체
        this.senderProfileUrl = null;         // 프로필 사진은 없으므로 null
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
    public void setRepliedMessageInfo(ChatMessageDto repliedMessageInfo) {
        this.repliedMessageInfo = repliedMessageInfo;
    }
    public void setUnreadCount(int totalMembers) {
        if (this.readBy != null) {
            this.unreadCount = totalMembers - this.readBy.size();
        } else {
            this.unreadCount = totalMembers > 0 ? totalMembers - 1 : 0;
        }
        if (this.unreadCount < 0) {
            this.unreadCount = 0;
        }
    }
}

