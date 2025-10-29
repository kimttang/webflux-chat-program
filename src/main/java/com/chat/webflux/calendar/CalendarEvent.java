package com.chat.webflux.calendar;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

//MongoDB의 "calendar_events" 컬렉션에 매핑되는 엔티티 클래스
@Document(collection = "calendar_events")
@Data
public class CalendarEvent {

    //MongoDB의 기본 키 '_id' 필드에 매핑
    @Id
    private String id;
    private String title;
    private Instant start;

    // 개인용 또는 채팅방용을 저장
    private String scope;

    //scope가 "PERSONAL"이면 userId, "ROOM"이면 roomId가 저장됨
    private String ownerId;
}