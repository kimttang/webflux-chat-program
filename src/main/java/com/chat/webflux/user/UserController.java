//이 컨트롤러는 **사용자(User)**의 **CRUD(생성, 읽기, 수정, 삭제)**와 **인증(Authentication)**을 담당하는 핵심 API 엔드포인트입니다.
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

@RestController// 사용자(User) 관련 API (회원가입, 로그인, 프로필) 요청을 처리하는 컨트롤러
@RequestMapping("/api/users")// 이 컨트롤러의 모든 API는 "/api/users" 경로 하위에 매핑됨
@RequiredArgsConstructor// final 필드(userService)용 생성자를 자동 생성
public class UserController {
    // 사용자 관련 핵심 비즈니스 로직(DB CRUD, 암호화)을 처리하는 서비스
    private final UserService userService;
    private final PresenceService presenceService;
    // (POST) 회원가입 API
    @PostMapping("/signup")
    public Mono<ResponseEntity<Object>> signup(@RequestBody User user) {
        // user 객체에서 nickname을 가져와 서비스로 전달
        return userService.signup(user.getUsername(), user.getPassword(), user.getNickname())
                .map(savedUser -> ResponseEntity.ok().body((Object) savedUser))
                .onErrorResume(IllegalArgumentException.class, e ->
                        Mono.just(ResponseEntity.badRequest().body((Object) e.getMessage()))
                );
    }
    // (POST) 로그인 API
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
    // (GET) 특정 사용자의 상세 정보 조회 (비밀번호 필드는 User 엔티티의 @JsonProperty에 의해 자동 제외됨)
    @GetMapping("/{username}/details")
    public Mono<User> getUserDetails(@PathVariable String username) {
        return userService.findByUsername(username);
    }
    // (POST) 사용자 프로필 수정 (닉네임 변경, 프로필 사진 업로드)
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

    @DeleteMapping("/{currentUsername}/friends/{friendUsername}")
    public Mono<ResponseEntity<Void>> deleteFriend(
            @PathVariable String currentUsername,
            @PathVariable String friendUsername) {

        return userService.deleteFriend(currentUsername, friendUsername)
                .thenReturn(ResponseEntity.ok().<Void>build()) // 성공 시 200 OK
                .onErrorResume(IllegalArgumentException.class, e ->
                        // 사용자를 찾을 수 없는 경우 404 Not Found
                        Mono.just(ResponseEntity.notFound().build())
                );
    }

    // (DELETE) 회원 탈퇴 API
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