package com.chat.webflux.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TypingEvent {
    private String type;
    private String nickname;
}