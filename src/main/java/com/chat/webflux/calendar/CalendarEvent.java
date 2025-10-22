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
}