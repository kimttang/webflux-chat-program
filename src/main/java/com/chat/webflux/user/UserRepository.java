//이 코드는 User 엔티티에 대한 **데이터베이스 접근(Data Access)**을 처리하는 Spring Data MongoDB 리포지토리 인터페이스입니다.
package com.chat.webflux.user;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

// "User" 엔티티를 관리하는 리포지토리 인터페이스
// ReactiveMongoRepository<[엔티티 클래스], [ID 타입]>을 상속
public interface UserRepository extends ReactiveMongoRepository<User, String> {
    // [쿼리 메서드 1] 고유한 "username"으로 사용자를 조회 (Mono: 0개 또는 1개 반환)
    Mono<User> findByUsername(String username);
    // [쿼리 메서드 2] "username 목록(List)"에 포함된 "모든" 사용자를 조회 (Flux: 0개 이상 반환)
    Flux<User> findByUsernameIn(List<String> usernames);

    // 특정 사용자를 친구로 가지고 있는 모든 사용자를 찾는 기능
    Flux<User> findAllByFriendUsernamesContaining(String username);
}