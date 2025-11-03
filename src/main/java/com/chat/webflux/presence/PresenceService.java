package com.chat.webflux.presence;

import com.chat.webflux.dto.PresenceEvent;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.time.Duration;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service// 이 클래스가 Spring의 서비스 빈(Bean)임을 선언
@Slf4j// 로깅을 위한 Lombok 어노테이션
@RequiredArgsConstructor
public class PresenceService {
    // DB에서 사용자 정보를 조회하기 위한 리포지토리
    private final UserRepository userRepository;
    // SSE 이벤트 객체(PresenceEvent)를 JSON 문자열로 직렬화하기 위한 객체
    private final ObjectMapper objectMapper;
    // [핵심 데이터 1] 현재 "온라인"인 모든 사용자의 ID(username)를 실시간으로 저장하는 Set (메모리 기반)
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();
    // [핵심 데이터 2] 사용자별 SSE 이벤트 스트림(Sink)을 저장하는 Map
    private final Map<String, Sinks.Many<String>> userSinks = new ConcurrentHashMap<>();
    // 사용자가 온라인 상태가 되었을 때 호출됨 (주로 WebSocket 연결 시)
    public void userOnline(String username) {
        if (username == null) {
            log.warn("Attempted to set user online with null username.");
            return;
        }
        if (onlineUsers.add(username)) {
            log.info("User ONLINE: {}", username);
            broadcastStatusToFriends(username, "ONLINE");
        }
    }
    // 사용자가 오프라인 상태가 되었을 때 호출됨 (주로 WebSocket 연결 종료 시)
    public void userOffline(String username) {
        if (username == null) {
            log.warn("Attempted to set user offline with null username.");
            return;
        }
        if (onlineUsers.remove(username)) {
            log.info("User OFFLINE: {}", username);
            broadcastStatusToFriends(username, "OFFLINE");
        }
    }
    // Controller의 SSE 구독 API (/api/presence/{username}/subscribe)가 호출하는 메서드
    public Flux<String> subscribe(String username) {
        Sinks.Many<String> sink = userSinks.computeIfAbsent(username, u -> Sinks.many().multicast().onBackpressureBuffer());

        // 15초마다 하트비트(연결 유지용 주석)를 보내 연결이 끊어지는 것을 방지합니다.
        Flux<String> heartbeat = Flux.interval(Duration.ofSeconds(15))
                .map(i -> ":heartbeat\n\n");

        // 구독 시작 시 연결 성공 이벤트를 한 번 보냅니다.
        Mono<String> initialEvent = Mono.fromCallable(() -> "event: connection_established\ndata: {\"status\":\"ok\"}\n\n");

        // 실제 이벤트 스트림과 하트비트 스트림을 합칩니다.
        return Flux.concat(initialEvent, Flux.merge(sink.asFlux(), heartbeat));
    }

    // Controller의 1회성 조회 API (/api/presence/{username}/friends/online)가 호출하는 메서드
    public Mono<Set<String>> getOnlineFriendUsernames(String currentUsername) {
        return userRepository.findByUsername(currentUsername)
                .map(User::getFriendUsernames)
                .map(friendUsernames -> friendUsernames.stream()
                        .filter(onlineUsers::contains)
                        .collect(Collectors.toSet()));
    }
    // [헬퍼 메서드 1] 특정 대상(targetUsername)에게 상태 변경 이벤트를 "1회" 전송
    public void broadcastStatusUpdate(String targetUsername, String userInEvent, String status) {
        log.info("[SSE SEND] Target: {}, EventUser: {}, Status: {}", targetUsername, userInEvent, status);
        Sinks.Many<String> sink = userSinks.get(targetUsername);
        if (sink != null) {
            try {
                // PresenceEvent DTO를 재사용하여 "DELETED" 상태를 전송
                String message = "data: " + objectMapper.writeValueAsString(new PresenceEvent(userInEvent, status)) + "\n\n";
                sink.tryEmitNext(message);
                log.info("[SSE SEND] SINK 전송 성공 (Target: {})", targetUsername);
            } catch (JsonProcessingException e) {
                log.error("PresenceEvent 직렬화 오류", e);
            }
        }
        else {

            log.warn("[SSE SEND] SINK를 찾지 못함 (Target: {}). (대상이 오프라인이거나 연결된 적 없음)", targetUsername);
        }
    }
    // [헬퍼 메서드 2] 상태가 변경된 사용자(username)의 "모든 친구"에게 상태 변경을 방송
    private void broadcastStatusToFriends(String username, String status) {
        userRepository.findAllByFriendUsernamesContaining(username)
                .map(User::getUsername)
                .filter(friendUsername -> !friendUsername.equals(username))
                .doOnNext(friendUsername -> {
                    broadcastStatusUpdate(friendUsername, username, status);
                })
                .subscribe();
    }
}