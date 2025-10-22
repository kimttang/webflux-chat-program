package com.chat.webflux.calendar; // (님의 패키지)

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventRepository calendarEventRepository;

    /**
     * ✨ [신규] FullCalendar가 알아들을 수 있는 DTO (도우미 클래스)
     * (컨트롤러 파일 내부에 private static class로 선언)
     */
    @lombok.Data
    private static class FullCalendarDto {
        private String id;
        private String title;
        private String start; // Instant 대신 "문자열"로 변경

        // DB에서 가져온 CalendarEvent를 이 DTO로 변환하는 생성자
        public FullCalendarDto(CalendarEvent event) {
            this.id = event.getId();
            this.title = event.getTitle();

            // ✨ [핵심] Instant 객체를 강제로 ISO 8601 "문자열"로 변환
            this.start = event.getStart().toString();
        }
    }

    /**
     * ✨ [수정] "읽기(R)": DB에서 읽은 데이터를 FullCalendarDto로 변환하여 반환
     */
    @GetMapping
    public Flux<FullCalendarDto> getAllEvents() { // ✨ 반환 타입을 DTO로 변경

        return calendarEventRepository.findAll() // 1. DB에서 CalendarEvent를 찾아서
                .map(FullCalendarDto::new);      // 2. DTO로 변환한 뒤 (map) 반환
    }
}