package com.chat.webflux.message;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ChatMessageRepository extends ReactiveMongoRepository<ChatMessage, String> {
    Flux<ChatMessage> findByRoomIdOrderByCreatedAtAsc(String roomId);
    Mono<Void> deleteByRoomId(String roomId);
    @Query("{ 'roomId': ?0, 'content': { '$regex': ?1, '$options': 'i' } }")
    Flux<ChatMessage> findByRoomIdAndSearchKeyword(String roomId, String keyword);
    Mono<ChatMessage> findTopByRoomIdOrderByCreatedAtDesc(String roomId);

    // 파일 모와보기 기능
    Flux<ChatMessage> findByRoomIdAndFileUrlIsNotNullOrderByCreatedAtDesc(String roomId);
}