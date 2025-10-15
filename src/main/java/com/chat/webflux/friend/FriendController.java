package com.chat.webflux.friend;

import com.chat.webflux.user.User;
import com.chat.webflux.user.UserService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final UserService userService;

    @Getter
    @Setter
    private static class FriendRequest {
        private String currentUsername;
        private String friendUsername;
    }

    // 친구 추가 API
    @PostMapping("/add")
    public Mono<ResponseEntity<String>> addFriend(@RequestBody FriendRequest request) {
        return userService.addFriend(request.getCurrentUsername(), request.getFriendUsername())
                .map(user -> ResponseEntity.ok("'" + request.getFriendUsername() + "'님을 친구로 추가했습니다."))
                .onErrorResume(IllegalArgumentException.class, e ->
                        Mono.just(ResponseEntity.badRequest().body(e.getMessage()))
                );
    }

    // 친구 목록 조회 API
    @GetMapping("/{username}")
    public Flux<User> getFriends(@PathVariable String username) {
        return userService.getFriends(username);
    }
}
