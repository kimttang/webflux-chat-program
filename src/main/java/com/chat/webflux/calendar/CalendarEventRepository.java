package com.chat.webflux.calendar;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

/*
    캘린더 일정(CalendarEvent) 엔티티에 대한 데이터베이스 접근(Data Access)을 처리하는 리포지토리 인터페이스
    ReactiveMongoRepository를 상속받아 기본적인 CRUD 및 페이징/정렬 기능을 비동기 방식으로 자동 구현
*/

public interface CalendarEventRepository extends ReactiveMongoRepository<CalendarEvent, String> {

    // "범위(scope)"와 "소유자 ID(ownerId)"로 모든 일정을 찾음
    Flux<CalendarEvent> findByScopeAndOwnerId(String scope, String ownerId);

}