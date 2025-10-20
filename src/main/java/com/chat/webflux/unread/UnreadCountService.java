package com.chat.webflux.unread;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException; // [1. Import 추가]
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UnreadCountService {

    private final UnreadCountRepository unreadCountRepository;

    // [2. incrementUnreadCount 메서드를 덮어쓰기]
    public Mono<Void> incrementUnreadCount(String userId, String roomId) {
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next()
                .switchIfEmpty(Mono.defer(() -> unreadCountRepository.save(new UnreadCount(userId, roomId)))
                        .onErrorResume(DuplicateKeyException.class,
                                e -> unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next())
                )
                .flatMap(unreadCount -> {
                    unreadCount.setCount(unreadCount.getCount() + 1);
                    return unreadCountRepository.save(unreadCount);
                }).then();
    }

    // [3. resetUnreadCount 메서드를 덮어쓰기]
    public Mono<Void> resetUnreadCount(String userId, String roomId) {
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next()
                .switchIfEmpty(Mono.defer(() -> unreadCountRepository.save(new UnreadCount(userId, roomId)))
                        // [핵심] reset에서도 동일하게 레이스 컨디D션 처리
                        .onErrorResume(DuplicateKeyException.class,
                                e -> unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next())
                )
                .flatMap(unreadCount -> {
                    if (unreadCount.getCount() > 0) {
                        unreadCount.setCount(0);
                        return unreadCountRepository.save(unreadCount);
                    }
                    return Mono.empty();
                }).then();
    }

    // (이 메서드는 수정 없음)
    public Flux<UnreadCount> getUnreadCounts(String userId) {
        return unreadCountRepository.findByUserId(userId);
    }
}