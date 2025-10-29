package com.chat.webflux.presence;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;
//사용자의 실시간 접속 상태(Presence)관련 API 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/api/presence") //이 컨트롤러의 모든 API는 "/api/presence" 경로로 매핑
@RequiredArgsConstructor // final 필드(presenceService)용 생성자를 자동 생성
public class PresenceController {
    // 접속 상태 관련 비즈니스 로직을 처리하는 서비스
    private final PresenceService presenceService;
    // (GET) 특정 사용자의 친구들 접속 상태 변경 이벤트를 실시간(SSE)으로 구독
    // produces = MediaType.TEXT_EVENT_STREAM_VALUE : 이 API가 SSE 스트림 응답임을 명시
    @GetMapping(value = "/{username}/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> subscribeToPresenceUpdates(@PathVariable String username) {
        // 실제 구독 로직은 서비스에 위임
        return presenceService.subscribe(username);
    }
    // (GET) 현재 온라인 상태인 친구들의 사용자 ID 목록을 1회성으로 조회
    @GetMapping("/{username}/friends/online")
    public Mono<Set<String>> getOnlineFriends(@PathVariable String username) {
        // 온라인 친구 목록 조회 로직을 서비스에 위임
        return presenceService.getOnlineFriendUsernames(username);
    }
}