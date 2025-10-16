package com.chat.webflux.chatroom;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "chatrooms")
public class ChatRoom {

    @Id
    private String id;
    private String name;
    private String profilePictureUrl;
    private String createdBy;
    private LocalDateTime createdAt;
    private Set<String> members = new HashSet<>();

    // 그룹 채팅방 생성을 위한 생성자
    public ChatRoom(String name, String createdBy) {
        this.name = name;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.members.add(createdBy);
    }

    // 1:1 채팅방(DM) 생성을 위한 생성자
    public ChatRoom(String id, String name, String fromUser, String toUser) {
        this.id = id;
        this.name = name;
        this.createdBy = fromUser;
        this.createdAt = LocalDateTime.now();
        this.members.add(fromUser);
        this.members.add(toUser);
    }
}