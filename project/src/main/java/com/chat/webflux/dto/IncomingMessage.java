package com.chat.webflux.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
// 알려지지 않은 JSON 필드가 들어와도 오류 없이 무시하도록 설정
@JsonIgnoreProperties(ignoreUnknown = true)
public class IncomingMessage {
    private String type;
    private String nickname;
    private String message;
    private String targetLang;
    private String messageId;
    private List<String> messageIds;
    private String replyToMessageId;
}