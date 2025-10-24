package com.chat.webflux.calendar;

import lombok.RequiredArgsConstructor;
import com.chat.webflux.chatroom.ChatRoomRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
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
    private final ChatRoomRepository chatRoomRepository;

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
    @lombok.Data
    private static class UpdateEventDto {
        private String title;  // (JS가 보낼) 새 제목
        private String start;  // (JS가 보낼) 새 시작 시간 (드래그)
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

    //D (삭제) API
    @DeleteMapping("/{eventId}")
    public Mono<ResponseEntity<Void>> deleteEvent( // ✨ 1. 반환 타입을 Mono<ResponseEntity<Void>>로 변경
                                                   @PathVariable String eventId,
                                                   @RequestParam String userId) {

        // 1. DB에서 삭제할 이벤트를 찾음
        return calendarEventRepository.findById(eventId)
                .flatMap(event -> {

                    // 2. [임시] 권한 확인 (주석 처리된 상태)
                    Mono<Void> permissionCheck = Mono.empty();
                    /*
                    if ("PERSONAL".equals(event.getScope())) { ... }
                    else if ("ROOM".equals(event.getScope())) { ... }
                    */

                    // 3. ✨ [로직 수정] 삭제 후, 명시적으로 "200 OK" 응답 반환
                    return permissionCheck
                            .then(calendarEventRepository.delete(event))
                            // 성공 시: "200 OK" 빈 응답(ResponseEntity)을 반환
                            .then(Mono.just(ResponseEntity.ok().<Void>build()));
                })
                // ✨ 4. [로직 수정] ID로 못 찾았을 때만 "404 Not Found" 응답 반환
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }


    /**
     * ===================================================================
     * U (수정) API (권한 확인 "임시 주석")
     * ===================================================================
     */
    @PutMapping("/{eventId}")
    public Mono<CalendarEvent> updateEvent(
            @PathVariable String eventId,
            @RequestParam String userId,
            @RequestBody UpdateEventDto dto) {

        // 1. DB에서 수정할 이벤트를 찾음
        return calendarEventRepository.findById(eventId)
                .flatMap(event -> {

                    // 2. [임시 수정] 권한 확인 로직을 "전부" 주석 처리 (테스트용)
                    Mono<Void> permissionCheck = Mono.empty(); // (무조건 통과)

                    /*
                    if ("PERSONAL".equals(event.getScope())) {
                        if (event.getOwnerId().equals(userId)) {
                            permissionCheck = Mono.empty();
                        } else {
                            permissionCheck = Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "개인 일정 수정 권한이 없습니다."));
                        }
                    }
                    else if ("ROOM".equals(event.getScope())) {
                        String roomId = event.getOwnerId();
                        permissionCheck = chatRoomRepository.findById(roomId)
                            .flatMap(room -> {
                                if (room.getMembers().contains(userId)) {
                                    return Mono.empty();
                                } else {
                                    return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "공용 일정 수정 권한이 없습니다."));
                                }
                            })
                            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다.")))
                            .then();
                    }
                    else {
                        permissionCheck = Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "알 수 없는 일정 타입입니다."));
                    }
                    */

                    // 3. 권한 확인이 성공했을 때만(.then) 수정 로직 실행
                    return permissionCheck.then(Mono.fromCallable(() -> {
                                if (dto.getTitle() != null) {
                                    event.setTitle(dto.getTitle());
                                }
                                if (dto.getStart() != null) {
                                    event.setStart(Instant.parse(dto.getStart()));
                                }
                                return event;
                            }))
                            .flatMap(calendarEventRepository::save);
                })
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "수정할 일정을 찾을 수 없습니다.")));
    }
}