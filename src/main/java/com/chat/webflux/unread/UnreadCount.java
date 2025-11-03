package com.chat.webflux.unread;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

//이 클래스는 **"어떤 유저(userId)가 어떤 채팅방(roomId)에서 메시지를 몇 개(count) 안 읽었는지"**를 저장하는 MongoDB 문서(unread_counts 컬렉션)에 매핑되는 엔티티입니다.
@Getter
@Setter
@NoArgsConstructor
@Document(collection = "unread_counts")
// [핵심] "userId"와 "roomId" 필드의 조합을 "유니크(unique)"하게 설정하는 복합 인덱스
// (한 명의 유저가 같은 방에 대해 2개 이상의 안 읽음 카운트 문서를 가질 수 없도록 보장)
@CompoundIndex(def = "{'userId': 1, 'roomId': 1}", unique = true)
public class UnreadCount {
    // 문서의 고유 ID (MongoDB의 기본 키 '_id' 필드에 매핑)
    @Id
    private String id;
    private String userId;
    private String roomId;
    private int count;

    // 새 카운트 문서를 생성할 때 사용하는 생성자 (서비스 로직에서 호출됨)
    public UnreadCount(String userId, String roomId) {
        this.userId = userId;
        this.roomId = roomId;
        this.count = 0;
    }
}