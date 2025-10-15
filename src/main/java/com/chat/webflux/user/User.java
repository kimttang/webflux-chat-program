package com.chat.webflux.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String username; // 로그인 시 사용할 고유 아이디
    private String nickname; // 화면에 표시될 이름

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String profilePictureUrl;

    private List<String> friendUsernames = new ArrayList<>();
}