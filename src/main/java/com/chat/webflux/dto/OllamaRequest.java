package com.chat.webflux.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

// Ollama AI API에 "채팅 완료" 요청을 보낼 때 HTTP Request Body의 전체 구조를 정의하는 DTO
@Getter
@AllArgsConstructor

public class OllamaRequest {
    private String model;
    private List<OllamaMessage> messages;
    private boolean stream;
}