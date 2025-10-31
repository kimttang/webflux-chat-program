package com.chat.webflux.dto;

import lombok.Getter;
import lombok.Setter;

//WebSocket을 통해 "사용자 입력 중..." 이벤트를 주고받기 위해 사용하는 DTO
@Getter
@Setter

public class TypingEvent {
    private String type;
    private String nickname;
}