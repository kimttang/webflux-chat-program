package com.chat.webflux.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.yaml.snakeyaml.nodes.NodeId.mapping;

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

        // 2. ✨ [수정] "NodeId"가 아닌 "SimpleUrlHandlerMapping"으로 정확히 선언
        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping(map, 1);

        // 3. CORS 설정 생성 및 추가
        Map<String, CorsConfiguration> corsMap = new HashMap<>();
        CorsConfiguration corsConfig = new CorsConfiguration();

        // ✨ [보안 적용] "*" 대신 실제 프론트엔드 주소만 허용
        corsConfig.setAllowedOrigins(List.of("http://localhost:8080", "http://127.0.0.1:8080"));
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);

        corsMap.put("/chat/**", corsConfig);

        mapping.setCorsConfigurations(corsMap);

        return mapping;
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}