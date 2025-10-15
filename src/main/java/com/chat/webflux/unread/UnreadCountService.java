package com.chat.webflux.unread;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UnreadCountService {

    private final UnreadCountRepository unreadCountRepository;

    // 특정 방의 특정 사용자에 대해 안 읽은 메시지 수 증가
    public Mono<Void> incrementUnreadCount(String userId, String roomId) {
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId)
                .switchIfEmpty(Mono.defer(() -> unreadCountRepository.save(new UnreadCount(userId, roomId))))
                .flatMap(unreadCount -> {
                    unreadCount.setCount(unreadCount.getCount() + 1);
                    return unreadCountRepository.save(unreadCount);
                }).then();
    }

    // 특정 방의 특정 사용자에 대해 안 읽은 메시지 수 초기화
    public Mono<Void> resetUnreadCount(String userId, String roomId) {
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId)
                .flatMap(unreadCount -> {
                    unreadCount.setCount(0);
                    return unreadCountRepository.save(unreadCount);
                }).then();
    }

    // 특정 사용자의 모든 안 읽은 메시지 수 가져오기
    public Flux<UnreadCount> getUnreadCounts(String userId) {
        return unreadCountRepository.findByUserId(userId);
    }
}