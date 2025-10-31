package com.chat.webflux.message;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

// 채팅 메시지(ChatMessage) 엔티티에 대한 데이터베이스 접근을 처리하는 리포지토리
// ReactiveMongoRepository를 상속받아 비동기 CRUD 기능을 자동 구현
public interface ChatMessageRepository extends ReactiveMongoRepository<ChatMessage, String> {

    // 특정 채팅방(roomId)의 모든 메시지를 "생성된 시간(createdAt) 오름차순(Asc)" (오래된 순)으로 조회
    Flux<ChatMessage> findByRoomIdOrderByCreatedAtAsc(String roomId);

    // 특정 채팅방(roomId)과 관련된 "모든" 메시지를 삭제
    Mono<Void> deleteByRoomId(String roomId);

    // 특정 채팅방(roomId)에서 특정 'keyword'가 'content' 필드에 포함된 모든 메시지를 조회
    @Query("{ 'roomId': ?0, 'content': { '$regex': ?1, '$options': 'i' } }")
    Flux<ChatMessage> findByRoomIdAndSearchKeyword(String roomId, String keyword);

    // 특정 채팅방(roomId)에서 "가장 최근(Top)의" 메시지 1개(Mono)를 "생성된 시간(createdAt) 내림차순(Desc)" (최신순)으로 조회
    Mono<ChatMessage> findTopByRoomIdOrderByCreatedAtDesc(String roomId);

    // 파일 모와보기 기능(갤러리)
    Flux<ChatMessage> findByRoomIdAndFileUrlIsNotNullOrderByCreatedAtDesc(String roomId);
}