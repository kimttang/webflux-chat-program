package com.chat.webflux.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Map;
import java.util.Collections;
import java.util.HashMap;

@Configuration
public class WebSocketConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        // Java 8의 시간 타입을 지원하는 모듈을 등록합니다. (핵심 수정)
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }

    @Bean
    public HandlerMapping handlerMapping(WebSocketHandler chatWebSocketHandler) {
        // 1. 기존 핸들러 맵 생성
        Map<String, WebSocketHandler> map = Map.of("/chat/**", chatWebSocketHandler);

        // 2. 매핑 객체 생성
        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping(map, 1);

        // 3. ✨ CORS 설정 생성 및 추가
        Map<String, CorsConfiguration> corsMap = new HashMap<>();
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOrigins(Collections.singletonList("*")); // 모든 IP 허용
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");

        corsMap.put("/chat/**", corsConfig); // "/chat/**" 경로에 이 CORS 설정 적용
        mapping.setCorsConfigurations(corsMap);

        return mapping; // 4. 설정이 적용된 매핑 반환
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}