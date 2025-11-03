package com.chat.webflux.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;

// Ollama AI API로부터 "응답"을 수신할 때 HTTP Response Body의 전체 구조를 파싱하기 위한 DTO
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)

public class OllamaResponse {
    private ResponseMessage message;
}