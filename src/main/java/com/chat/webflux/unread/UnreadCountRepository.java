package com.chat.webflux.unread;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UnreadCountRepository extends ReactiveMongoRepository<UnreadCount, String> {
    Flux<UnreadCount> findByUserId(String userId);
    Mono<UnreadCount> findByUserIdAndRoomId(String userId, String roomId);
    Mono<Void> deleteByRoomId(String roomId);
}