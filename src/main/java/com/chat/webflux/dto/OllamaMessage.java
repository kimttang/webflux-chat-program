package com.chat.webflux.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// Ollama AI 모델 API에 요청을 보낼 때 메시지의 구조를 정의하기 위한 DTO
@Getter
@AllArgsConstructor

public class OllamaMessage {
    private String role;
    private String content;
}