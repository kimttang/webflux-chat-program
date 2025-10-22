package com.chat.webflux.calendar;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

public interface CalendarEventRepository extends ReactiveMongoRepository<CalendarEvent, String> {
}