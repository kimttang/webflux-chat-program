package com.chat.webflux.calendar;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface CalendarEventRepository extends ReactiveMongoRepository<CalendarEvent, String> {

    // "범위(scope)"와 "소유자 ID(ownerId)"로 모든 일정을 찾습니다.

    Flux<CalendarEvent> findByScopeAndOwnerId(String scope, String ownerId);
}