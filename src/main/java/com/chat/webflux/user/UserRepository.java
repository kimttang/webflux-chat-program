package com.chat.webflux.user;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.List;

public interface UserRepository extends ReactiveMongoRepository<User, String> {
    Mono<User> findByUsername(String username);
    Flux<User> findByUsernameIn(List<String> usernames);

    // 특정 사용자를 친구로 가지고 있는 모든 사용자를 찾는 기능
    Flux<User> findAllByFriendUsernamesContaining(String username);
}