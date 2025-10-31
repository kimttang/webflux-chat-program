package com.chat.webflux.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

//사용자의 접속 상태 변경 이벤트를 SSE 스트림을 통해 클라이언트로 전송하기 위한 DTO
@Getter
@AllArgsConstructor

public class PresenceEvent {
    private String username; // 접속 상태가 변경된 사용자의 ID
    private String status; // 변경된 "상태" "ONLINE" or "OFFLINE"
}