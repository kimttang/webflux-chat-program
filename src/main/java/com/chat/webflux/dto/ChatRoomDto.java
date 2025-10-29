package com.chat.webflux.dto;

import com.chat.webflux.chatroom.ChatRoom;
import com.chat.webflux.message.ChatMessage;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import java.time.Instant;
import java.util.Set;

// 실시간 채팅방 목록(SSE)을 프론트엔드로 전송하기 위한 DTO 클래스
@Getter
public class ChatRoomDto {

    // ChatRoom 엔티티에서 복사되는 필드
    private final String id;
    private final String name;
    private final String profilePictureUrl;
    private final Set<String> members;
    private final LastMessageDto lastMessage;
    private final int unreadCount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private final Instant roomCreatedAt;
    private final String announcement;

    // 메인 생성자
    public ChatRoomDto(ChatRoom chatRoom, ChatMessage lastMessage, int unreadCount) {
        this.id = chatRoom.getId();
        this.name = chatRoom.getName();
        this.profilePictureUrl = chatRoom.getProfilePictureUrl();
        this.members = chatRoom.getMembers();
        this.lastMessage = (lastMessage != null) ? new LastMessageDto(lastMessage) : null;
        this.unreadCount = unreadCount;
        this.roomCreatedAt = chatRoom.getCreatedAt();
        this.announcement = chatRoom.getAnnouncement();
    }

    // 채팅방 목록의 "마지막 메시지" 미리보기 정보를 담는 내부 DTO
    @Getter
    public static class LastMessageDto {
        private final String content;
        private final ChatMessage.MessageType messageType;
        private final Instant createdAt;

        public LastMessageDto(ChatMessage message) {
            this.content = (message.getMessageType() == ChatMessage.MessageType.FILE || message.getMessageType() == ChatMessage.MessageType.IMAGE) ?
                    message.getMessageType().toString() : // 파일/이미지 메시지는 content를 파일 이름으로 사용
                    message.getContent();
            this.messageType = message.getMessageType();
            this.createdAt = message.getCreatedAt();
        }
    }
}