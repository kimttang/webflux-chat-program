package com.chat.webflux.chatroom;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/*
 MongoDB의 "chatrooms" 컬렉션에 매핑되는 엔티티 클래스
 채팅방의 기본 정보(이름, 멤버, 생성일 등)를 저장
*/

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "chatrooms")
public class ChatRoom {

    //채팅방의 고유 ID, MongoDB의 기본 키 '_id' 필드에 매핑
    @Id
    private String id;
    private String name;
    private String profilePictureUrl;
    private String createdBy;
    private Instant createdAt;
    private Set<String> members = new HashSet<>();
    private String announcement;

    private boolean isDm;

    // 그룹 채팅방 생성을 위한 생성자
    public ChatRoom(String name, String createdBy) {
        this.name = name;
        this.createdBy = createdBy;
        this.createdAt = Instant.now();
        this.members.add(createdBy);
        this.isDm = false;
    }

    // 1:1 채팅방(DM) 생성을 위한 생성자
    public ChatRoom(String id, String name, String fromUser, String toUser) {
        this.id = id;
        this.name = name;
        this.createdBy = fromUser;
        this.createdAt = Instant.now();
        this.members.add(fromUser);
        this.members.add(toUser);
        this.isDm = true;
    }
    private List<String> activeLanguages = new ArrayList<>();
}