package com.chat.webflux.unread;

import com.chat.webflux.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//이 컨트롤러는 **"안 읽은 메시지 수"**와 관련된 API를 처리합니다.
@Slf4j
@RestController
@RequestMapping("/api/unread")
@RequiredArgsConstructor
public class UnreadCountController {
    // 안 읽음 카운트 관련 DB 로직을 처리하는 서비스
    private final UnreadCountService unreadCountService;
    //  안 읽은 수를 리셋한 후, 채팅방 목록 SSE 스트림에 갱신 알림을 보내는 서비스
    private final ChatRoomService chatRoomService; // [6. ChatRoomService 의존성 주입]
    // (GET) 특정 사용자의 "모든" 안 읽음 카운트 정보를 조회 (예: 로그인 시 초기 데이터 로드용)
    @GetMapping("/{userId}")
    public Flux<UnreadCount> getUnreadCounts(@PathVariable String userId) {
        return unreadCountService.getUnreadCounts(userId);
    }

    // (POST) 특정 채팅방의 안 읽은 카운트를 0으로 "리셋"(사용자가 방에 입장하여 메시지를 읽었을 때 프론트엔드에서 호출됨)
    @PostMapping("/reset")
    public Mono<Void> resetUnreadCount(@RequestBody UnreadCount unreadCount) {
        // 1. 요청 본문(JSON)에서 userId와 roomId를 추출
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