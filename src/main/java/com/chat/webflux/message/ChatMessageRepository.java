package com.chat.webflux.message;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ChatMessageRepository extends ReactiveMongoRepository<ChatMessage, String> {
    Flux<ChatMessage> findByRoomIdOrderByCreatedAtAsc(String roomId);

    Mono<Void> deleteByRoomId(String roomId);
}