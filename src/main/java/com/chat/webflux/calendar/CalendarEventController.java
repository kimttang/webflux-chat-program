package com.chat.webflux.calendar;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.Instant;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventRepository calendarEventRepository;

    @lombok.Data
    private static class FullCalendarDto {
        private String id;
        private String title;
        private String start;

        public FullCalendarDto(CalendarEvent event) {
            this.id = event.getId();
            this.title = event.getTitle();
            this.start = event.getStart().toString();
        }
    }

    @lombok.Data
    private static class PersonalEventDto {
        private String title;  // "기획 회의"
        private String start;  // "2025-10-30T14:00:00Z" (JS가 변환해서 보냄)
        private String userId;
    }

    // "개인" 캘린더 조회 API

    @GetMapping("/personal/{userId}")
    public Flux<FullCalendarDto> getPersonalEvents(@PathVariable String userId) {
        // DB에서 "개인(PERSONAL)" 범위와 "내 ID(userId)"로 일정을 찾음
        return calendarEventRepository.findByScopeAndOwnerId("PERSONAL", userId)
                .map(FullCalendarDto::new); // DTO로 변환
    }

    // "채팅방 공용" 캘린더 조회 API
    @GetMapping("/room/{roomId}")
    public Flux<FullCalendarDto> getRoomEvents(@PathVariable String roomId) {
        // DB에서 "채팅방(ROOM)" 범위와 "채팅방 ID(roomId)"로 일정을 찾음
        return calendarEventRepository.findByScopeAndOwnerId("ROOM", roomId)
                .map(FullCalendarDto::new); // DTO로 변환
    }

    // 공용 일정을 "내 캘린더"로 복사(Create)
    @PostMapping("/copy-to-personal/{eventId}")
    public Mono<CalendarEvent> copyToPersonalCalendar(
            @PathVariable String eventId,
            @RequestParam String userId) { // (테스트를 위해 임시로 RequestParam 사용)

        // 1. 복사할 원본(ROOM) 이벤트를 ID로 찾음
        return calendarEventRepository.findById(eventId)
                .flatMap(originalEvent -> {
                    // 2. "개인" 캘린더용 새 이벤트 객체 생성
                    CalendarEvent personalEvent = new CalendarEvent();
                    personalEvent.setTitle(originalEvent.getTitle()); // 제목 복사
                    personalEvent.setStart(originalEvent.getStart()); // 시간 복사

                    // 3. 범위를 "개인"으로, 소유자를 "나"로 설정
                    personalEvent.setScope("PERSONAL");
                    personalEvent.setOwnerId(userId);

                    // 4. DB에 "새롭게" 저장 (Create)
                    return calendarEventRepository.save(personalEvent);
                });
    }

    @PostMapping("/personal")
    public Mono<CalendarEvent> createPersonalEvent(
            @RequestBody PersonalEventDto dto) { // 1-1에서 만든 DTO로 받음

        // 1. 새 개인 일정 객체 생성
        CalendarEvent newEvent = new CalendarEvent();
        newEvent.setTitle(dto.getTitle());
        newEvent.setStart(Instant.parse(dto.getStart())); // JS가 보낸 ISO 문자열을 Instant로

        // 2. [핵심] 범위를 "개인"으로, 소유자를 DTO의 userId로 설정
        newEvent.setScope("PERSONAL");
        newEvent.setOwnerId(dto.getUserId());

        // 3. DB에 저장 (Create)
        return calendarEventRepository.save(newEvent);
    }
}