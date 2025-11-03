//이 클래스는 MongoDB의 users 컬렉션에 매핑되는 핵심 엔티티로, 이 애플리케이션의 "사용자" 정보를 저장
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
@Document(collection = "users")// MongoDB의 "users" 컬렉션에 매핑되는 엔티티 클래스
public class User {
    // 문서의 고유 ID (MongoDB의 기본 키 '_id' 필드에 매핑)
    @Id
    private String id;
    private String username; // 로그인 시 사용할 고유 아이디
    private String nickname; // 화면에 표시될 이름

    // [보안] 이 필드는 "쓰기 전용(WRITE_ONLY)"
    // (API 응답으로 이 객체를 JSON으로 보낼 때, 이 "password" 필드는 자동으로 제외됨)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    // 프로필 사진 이미지의 URL (예: /uploads/profiles/uuid.png)
    private String profilePictureUrl;
    // 이 사용자가 "친구로 추가한" 다른 사용자들의 "username" 목록
    private List<String> friendUsernames = new ArrayList<>();
}