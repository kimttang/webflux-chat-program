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

import java.time.Duration; // Duration import 추가
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PresenceService {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();
    private final Map<String, Sinks.Many<String>> userSinks = new ConcurrentHashMap<>();

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


    public Mono<Set<String>> getOnlineFriendUsernames(String currentUsername) {
        return userRepository.findByUsername(currentUsername)
                .map(User::getFriendUsernames)
                .map(friendUsernames -> friendUsernames.stream()
                        .filter(onlineUsers::contains)
                        .collect(Collectors.toSet()));
    }

    private void broadcastStatusToFriends(String username, String status) {
        userRepository.findAllByFriendUsernamesContaining(username)
                .map(User::getUsername)
                .filter(friendUsername -> !friendUsername.equals(username))
                .doOnNext(friendUsername -> {
                    Sinks.Many<String> sink = userSinks.get(friendUsername);
                    if (sink != null) {
                        try {
                            String message = "data: " + objectMapper.writeValueAsString(new PresenceEvent(username, status)) + "\n\n";
                            sink.tryEmitNext(message);
                        } catch (JsonProcessingException e) {
                            log.error("PresenceEvent 직렬화 오류", e);
                        }
                    }
                })
                .subscribe();
    }
}