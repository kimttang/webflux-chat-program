package com.chat.webflux.calendar;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "calendar_events")
@Data
public class CalendarEvent {

    @Id
    private String id;
    private String title;
    private Instant start;

    // "PERSONAL" (개인용) 또는 "ROOM" (채팅방용)을 저장
    private String scope;

    //scope가 "PERSONAL"이면 userId, "ROOM"이면 roomId가 저장됨
    private String ownerId;
}