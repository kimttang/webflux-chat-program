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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

//실시간 양방향 통신을 위한 WebSocket 설정을 담당하는 클래스
@Configuration
public class WebSocketConfig {

    //[JSON 직렬화 설정]
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        // Java 8의 시간 타입을 지원하는 모듈을 등록
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }

    //[WebSocket 라우팅 및 CORS 설정]
    @Bean
    public HandlerMapping handlerMapping(WebSocketHandler chatWebSocketHandler) {
        // 1. 기존 핸들러 맵 생성
        Map<String, WebSocketHandler> map = Map.of("/chat/**", chatWebSocketHandler);

        // 2. URL 기반의 핸들러 매핑 객체를 생성
        SimpleUrlHandlerMapping mapping = new SimpleUrlHandlerMapping(map, 1);

        // 3. [WebSocket CORS 설정]
        Map<String, CorsConfiguration> corsMap = new HashMap<>();
        CorsConfiguration corsConfig = new CorsConfiguration();

        // 4. "WebConfig"와 동일하게, 프론트엔드 개발 서버 주소만 명시적으로 허용
        corsConfig.setAllowedOrigins(List.of("http://localhost:8080", "http://127.0.0.1:8080"));
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);

        //5. "/chat/**" 경로에 대해 위에서 만든 CORS 설정을 적용
        corsMap.put("/chat/**", corsConfig);
        mapping.setCorsConfigurations(corsMap);

        return mapping;
    }

    //WebSocketHandler를 실행할 수 있도록 어댑터 빈을 등록
    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}