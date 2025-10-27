package com.chat.webflux.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        // "로그인 화면" 자체를 허용합니다.
                        .pathMatchers(
                                "/",
                                "/index.html",
                                "/style.css",
                                "/script.js"
                        ).permitAll()

                        // 아이콘/로고 등 리소스 폴더 허용
                        .pathMatchers("/resource/**").permitAll()
                        // "회원가입"과 "로그인" API 경로 허용
                        .pathMatchers("/api/users/signup", "/api/users/login").permitAll()
                        // 파일 업로드 경로 (이건 나중에 인증된 사용자만으로 바꿀 수 있음)
                        .pathMatchers("/uploads/**").permitAll()
                        //  그 외 "모든" 요청은 "인증된" 사용자만 허용
                        .anyExchange().authenticated()
                )
                .build();
    }
}