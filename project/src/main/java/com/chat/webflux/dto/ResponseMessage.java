package com.chat.webflux.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Getter @NoArgsConstructor @JsonIgnoreProperties(ignoreUnknown = true)
public class ResponseMessage {
    private String content;
}