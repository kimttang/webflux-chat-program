package com.chat.webflux.unread;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "unread_counts")
public class UnreadCount {
    @Id
    private String id;
    private String userId;
    private String roomId;
    private int count;

    public UnreadCount(String userId, String roomId) {
        this.userId = userId;
        this.roomId = roomId;
        this.count = 0;
    }
}