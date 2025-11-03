//이 코드는 UnreadCount 엔티티에 대한 **데이터베이스 접근(Data Access)**을 처리하는 Spring Data MongoDB 리포지토리 인터페이스입니다.
package com.chat.webflux.unread;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
// "UnreadCount" 엔티티를 관리하는 리포지토리 인터페이스
// ReactiveMongoRepository<[엔티티 클래스], [ID 타입]>을 상속
public interface UnreadCountRepository extends ReactiveMongoRepository<UnreadCount, String> {
    // [쿼리 메서드 1] "userId"로 모든 안 읽음 카운트 문서를 조회 (Flux: 0개 이상 반환) (예: 로그인 시, 내가 안 읽은 "모든" 방의 카운트 정보를 가져올 때 사용)
    Flux<UnreadCount> findByUserId(String userId);
    // [쿼리 메서드 2] "userId"와 "roomId"로 특정 안 읽음 카운트 문서를 조회 (Flux: 0개 또는 1개 반환)
    // (서비스 로직에서는 .next()를 붙여 Mono<UnreadCount>처럼 사용)

    Flux<UnreadCount> findByUserIdAndRoomId(String userId, String roomId);
    // [쿼리 메서드 3] 특정 "roomId"에 해당하는 "모든" 안 읽음 카운트 문서를 삭제
    // (예: 채팅방이 삭제될 때, 관련 안 읽음 카운트 정보도 함께 정리할 때 사용)
    Mono<Void> deleteByRoomId(String roomId);
    // [쿼리 메서드 4] 특정 "userId"에 해당하는 "모든" 안 읽음 카운트 문서를 삭제
    // (예: 회원 탈퇴 시, 이 유저의 모든 안 읽음 카운트 정보를 정리할 때 사용)
    Mono<Void> deleteAllByUserId(String userId);
}