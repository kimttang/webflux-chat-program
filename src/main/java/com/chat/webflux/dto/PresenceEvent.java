package com.chat.webflux.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PresenceEvent {
    private String username;
    private String status; // "ONLINE" or "OFFLINE"
}