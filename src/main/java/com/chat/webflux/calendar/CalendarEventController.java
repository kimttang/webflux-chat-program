package com.chat.webflux.calendar;

import com.chat.webflux.chatroom.ChatRoom;
import com.chat.webflux.chatroom.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

//캘린더 일정(Event)의 CRUD API 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventRepository calendarEventRepository;
    private final ChatRoomRepository chatRoomRepository;

    // FullCalendar 라이브러리가 인식할 수 있는 형식으로 변환하기 위한 DTO
    @lombok.Data
    private static class FullCalendarDto {
        private String id;
        private String title;
        private String start;

        //CalendarEvent 엔티티를 FullCalendarDto로 변환하는 생성자
        public FullCalendarDto(CalendarEvent event) {
            this.id = event.getId();
            this.title = event.getTitle();
            this.start = event.getStart().toString();
        }
    }

    //"개인 일정" 생성 요청 시 프론트엔드가 보낼 JSON 본문을 매핑하기 위한 DTO
    @lombok.Data
    private static class PersonalEventDto {
        private String title;
        private String start;
        private String userId;
    }

    //일정 수정 요청 시 사용할 DTO
    @lombok.Data
    private static class UpdateEventDto {
        private String title;
        private String start;
    }

    //공용 일정 생성 요청 시 프론트엔드가 보낼 JSON 본문을 매핑하기 위한 DTO
    @lombok.Data
    private static class CreateEventDto {
        private String title;
        private String start;
    }

    // "개인" 캘린더 조회 API
    @GetMapping("/personal/{userId}")
    public Flux<FullCalendarDto> getPersonalEvents(@PathVariable String userId) {
        // DB에서 개인 캘린더 범위와 내 ID로 일정을 찾음
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
            @RequestParam String userId) {

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

    //"개인" 캘린더에 새 일정을 생성
    @PostMapping("/personal")
    public Mono<CalendarEvent> createPersonalEvent(
            @RequestBody PersonalEventDto dto) {

        // 1. 새 개인 일정 객체 생성
        CalendarEvent newEvent = new CalendarEvent();
        newEvent.setTitle(dto.getTitle());
        newEvent.setStart(Instant.parse(dto.getStart()));

        // 2. 범위를 "개인"으로, 소유자를 DTO의 userId로 설정
        newEvent.setScope("PERSONAL");
        newEvent.setOwnerId(dto.getUserId());

        // 3. DB에 저장
        return calendarEventRepository.save(newEvent);
    }

    //"공용 캘린더"에 새 일정을 생성합니다.
    @PostMapping("/ROOM/{roomId}")
    public Mono<CalendarEvent> createRoomEvent(
            @PathVariable String roomId,
            @RequestParam("userId") String userId,
            @RequestBody CreateEventDto dto) {

        // 1. 권한 확인
        Mono<ChatRoom> roomCheck = chatRoomRepository.findById(roomId)
                .filter(room -> room.getMembers().contains(userId))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "채팅방 멤버만 일정을 추가할 수 있습니다.")));

        // 2. 권한 확인이 성공하면 일정 생성 로직 실행
        return roomCheck.then(Mono.fromCallable(() -> {
                    CalendarEvent newEvent = new CalendarEvent();
                    newEvent.setTitle(dto.getTitle());
                    newEvent.setStart(Instant.parse(dto.getStart())); // DTO의 start string을 Instant로 변환
                    newEvent.setScope("ROOM");
                    newEvent.setOwnerId(roomId); // 이 일정의 주인은 "채팅방"
                    return newEvent;
                }))
                .flatMap(calendarEventRepository::save); // DB에 저장
    }

    //삭제 API
    @DeleteMapping("/{eventId}")
    public Mono<ResponseEntity<Void>> deleteEvent( // 반환 타입을 Mono<ResponseEntity<Void>>로 변경
                                                   @PathVariable String eventId,
                                                   @RequestParam String userId) {

        // 1. DB에서 삭제할 이벤트를 찾음
        return calendarEventRepository.findById(eventId)
                .flatMap(event -> {
                    Mono<Void> permissionCheck = Mono.empty();
                    // 3. 삭제 후, 명시적으로 "200 OK" 응답 반환
                    return permissionCheck
                            .then(calendarEventRepository.delete(event))
                            // 성공 시: "200 OK" 빈 응답(ResponseEntity)을 반환
                            .then(Mono.just(ResponseEntity.ok().<Void>build()));
                })
                // ID로 못 찾았을 때만 "404 Not Found" 응답 반환
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }


    //수동 '공용 일정' 생성을 위한 DTO 추가
    @lombok.Data
    private static class CreateRoomEventDto {
        private String title;
        private String start;
    }

    // 공용 일정 생성 API 추가
    @PostMapping("/room/{roomId}")
    public Mono<CalendarEvent> createRoomEvent(
            @PathVariable String roomId,
            @RequestBody CreateRoomEventDto dto) {

        // 1. 새 CalendarEvent 객체 생성
        CalendarEvent newEvent = new CalendarEvent();
        newEvent.setTitle(dto.getTitle());

        try {
            // 2. 프론트엔드에서 받은 UTC ISO 문자열을 Instant로 파싱
            newEvent.setStart(Instant.parse(dto.getStart()));
        } catch (Exception e) {
            // 3. 날짜 형식이 잘못된 경우 400 Bad Request 오류 반환
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CALENDAR_INVALID_DATE_FORMAT_ERROR", e));
        }

        // 4. "공용" 일정 정보 설정
        newEvent.setScope("ROOM");
        newEvent.setOwnerId(roomId);

        // 5. DB에 저장 후 반환
        return calendarEventRepository.save(newEvent);
    }


    //수정 API
    @PutMapping("/{eventId}")
    public Mono<CalendarEvent> updateEvent(
            @PathVariable String eventId,
            @RequestParam String userId,
            @RequestBody UpdateEventDto dto) {

        // 1. DB에서 수정할 이벤트를 찾음
        return calendarEventRepository.findById(eventId)
                .flatMap(event -> {
                    Mono<Void> permissionCheck = Mono.empty();
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