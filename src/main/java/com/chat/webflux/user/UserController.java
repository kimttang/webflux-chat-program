package com.chat.webflux.user;

import com.chat.webflux.presence.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PresenceService presenceService;

    @PostMapping("/signup")
    public Mono<ResponseEntity<Object>> signup(@RequestBody User user) {
        // user 객체에서 nickname을 가져와 서비스로 전달
        return userService.signup(user.getUsername(), user.getPassword(), user.getNickname())
                .map(savedUser -> ResponseEntity.ok().body((Object) savedUser))
                .onErrorResume(IllegalArgumentException.class, e ->
                        Mono.just(ResponseEntity.badRequest().body((Object) e.getMessage()))
                );
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Object>> login(@RequestBody User user) {
        return userService.login(user.getUsername(), user.getPassword())
                .map(loggedInUser -> ResponseEntity.ok().body((Object) loggedInUser))
                .onErrorResume(IllegalArgumentException.class, e ->
                        Mono.just(ResponseEntity.badRequest().body((Object) e.getMessage()))
                );
    }

    @GetMapping("/{username}/details")
    public Mono<User> getUserDetails(@PathVariable String username) {
        return userService.findByUsername(username);
    }

    @PostMapping("/{username}/profile")
    public Mono<ResponseEntity<User>> updateProfile(
            @PathVariable String username,
            @RequestPart("newNickname") String newNickname,
            @RequestPart(name = "profileImage", required = false) Mono<FilePart> filePartMono) {

        return userService.updateProfile(username, newNickname, filePartMono)
                .map(ResponseEntity::ok)
                .onErrorResume(IllegalArgumentException.class, e ->
                        Mono.just(ResponseEntity.badRequest().body(null))
                );
    }
}