package com.chat.webflux.user;

import com.chat.webflux.presence.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import java.util.ArrayList;

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
    public Mono<ResponseEntity<Object>> login(@RequestBody User user, ServerWebExchange exchange) { // 1. ServerWebExchange 추가
        return userService.login(user.getUsername(), user.getPassword())
                .flatMap(loggedInUser -> {

                    // 2. 인증 토큰 생성 (사용자 이름, 비번(null), 권한)
                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            loggedInUser.getUsername(),
                            null, // (비밀번호는 세션에 저장X)
                            new ArrayList<>()
                    );

                    // 3. 세션을 가져와서 "SPRING_SECURITY_CONTEXT"에 인증 정보 저장
                    return exchange.getSession()
                            .flatMap(session -> {
                                SecurityContextImpl securityContext = new SecurityContextImpl(authentication);
                                // (이 키 이름이 스프링 시큐리티의 표준입니다)
                                session.getAttributes().put("SPRING_SECURITY_CONTEXT", securityContext);

                                // 4. 세션을 저장하고, 성공하면 200 OK 응답
                                return session.save()
                                        .thenReturn(ResponseEntity.ok().body((Object) loggedInUser));
                            });
                })
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
    @DeleteMapping("/{username}")
    public Mono<ResponseEntity<Void>> deleteUser(@PathVariable String username) {
        return userService.deleteUser(username)
                .map(ResponseEntity::ok)
                .onErrorResume(IllegalArgumentException.class, e ->
                        Mono.just(ResponseEntity.notFound().build())
                )
                .onErrorResume(e ->
                        Mono.just(ResponseEntity.status(500).build())
                );
    }
}