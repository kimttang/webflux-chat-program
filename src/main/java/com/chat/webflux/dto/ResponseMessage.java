package com.chat.webflux.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

//Ollama AI API 응답 "내부"에 중첩된 'message' JSON 객체를 파싱하기 위한 DTO
@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)

//AI가 실제로 생성한 응답 텍스트
public class ResponseMessage {
    private String content;
}