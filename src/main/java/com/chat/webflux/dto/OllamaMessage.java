package com.chat.webflux.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter @AllArgsConstructor
public class OllamaMessage {
    private String role;
    private String content;
}