package com.chat.webflux.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
@Getter @AllArgsConstructor
public class OllamaRequest {
    private String model;
    private List<OllamaMessage> messages;
    private boolean stream;
}