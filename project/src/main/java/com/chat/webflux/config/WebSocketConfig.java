package com.chat.webflux.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.server.support.WebSocketHandlerAdapter;

import java.util.Map;

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
        Map<String, WebSocketHandler> map = Map.of("/chat/**", chatWebSocketHandler);
        return new SimpleUrlHandlerMapping(map, 1);
    }

    @Bean
    public WebSocketHandlerAdapter handlerAdapter() {
        return new WebSocketHandlerAdapter();
    }
}