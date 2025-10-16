package com.chat.webflux.dto;

import com.chat.webflux.chatroom.ChatRoom;
import com.chat.webflux.message.ChatMessage;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
public class ChatRoomDto {

    private final String id;
    private final String name;
    private final String profilePictureUrl;
    private final Set<String> members;
    private final LastMessageDto lastMessage; // 마지막 메시지 정보
    private final int unreadCount;

    public ChatRoomDto(ChatRoom chatRoom, ChatMessage lastMessage, int unreadCount) {
        this.id = chatRoom.getId();
        this.name = chatRoom.getName();
        this.profilePictureUrl = chatRoom.getProfilePictureUrl();
        this.members = chatRoom.getMembers();
        this.lastMessage = (lastMessage != null) ? new LastMessageDto(lastMessage) : null;
        this.unreadCount = unreadCount;
    }

    @Getter
    public static class LastMessageDto {
        private final String content;
        private final ChatMessage.MessageType messageType;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private final LocalDateTime createdAt;

        public LastMessageDto(ChatMessage message) {
            this.content = message.getContent();
            this.messageType = message.getMessageType();
            this.createdAt = message.getCreatedAt();
        }
    }
}