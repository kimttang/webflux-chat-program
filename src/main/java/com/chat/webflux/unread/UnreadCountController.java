package com.chat.webflux.unread;

import com.chat.webflux.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j // [5. @Slf4j 어노테이션 추가]
@RestController
@RequestMapping("/api/unread")
@RequiredArgsConstructor
public class UnreadCountController {

    private final UnreadCountService unreadCountService;
    private final ChatRoomService chatRoomService; // [6. ChatRoomService 의존성 주입]

    @GetMapping("/{userId}")
    public Flux<UnreadCount> getUnreadCounts(@PathVariable String userId) {
        return unreadCountService.getUnreadCounts(userId);
    }

    // [7. resetUnreadCount 메서드를 통째로 덮어쓰기]
    @PostMapping("/reset")
    public Mono<Void> resetUnreadCount(@RequestBody UnreadCount unreadCount) {

        String userId = unreadCount.getUserId();
        String roomId = unreadCount.getRoomId();

        // [방어 코드 1] script.js가 null을 보내면 400 오류 반환
        if (userId == null || roomId == null) {
            log.warn("resetUnreadCount 실패: userId 또는 roomId가 null입니다. UserID: {}, RoomID: {}", userId, roomId);
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId 또는 roomId가 null일 수 없습니다."));
        }

        // 1. DB 리셋(주요 작업)을 Mono로 정의합니다.
        Mono<Void> resetDbMono = unreadCountService.resetUnreadCount(userId, roomId);

        // 2. [핵심] SSE 갱신(부가 작업)을 별도 Mono로 정의합니다.
        Mono<Void> broadcastSseMono = Mono.fromRunnable(() -> {
            try {
                // 이 작업이 성공하면 클라이언트의 채팅방 목록이 즉시 갱신됩니다.
                chatRoomService.broadcastRoomListToUser(userId);
            } catch (Exception e) {
                // 이 작업이 실패해도 500 오류를 내지 않고 로그만 남깁니다.
                log.error("SSE 브로드캐스트 실패. userId: {}. Error: {}", userId, e.getMessage(), e);
            }
        }).onErrorResume(e -> {
            // 리액티브 체인에서 오류가 나도 로그만 남기고 무시합니다.
            log.error("SSE 브로드캐스트 리액티브 오류. userId: {}. Error: {}", userId, e.getMessage(), e);
            return Mono.empty();
        }).then();

        // 3. 주요 작업(DB 리셋)이 성공한 '후에' 부가 작업(SSE 갱신)을 실행합니다.
        return resetDbMono.then(broadcastSseMono);
    }
}