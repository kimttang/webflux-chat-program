package com.chat.webflux.unread;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/unread")
@RequiredArgsConstructor
public class UnreadCountController {

    private final UnreadCountService unreadCountService;

    @GetMapping("/{userId}")
    public Flux<UnreadCount> getUnreadCounts(@PathVariable String userId) {
        return unreadCountService.getUnreadCounts(userId);
    }

    // 사용자가 방에 입장했을 때 안 읽은 메시지 수를 0으로 리셋하는 API
    @PostMapping("/reset")
    public Mono<Void> resetUnreadCount(@RequestBody UnreadCount unreadCount) {
        return unreadCountService.resetUnreadCount(unreadCount.getUserId(), unreadCount.getRoomId());
    }
}