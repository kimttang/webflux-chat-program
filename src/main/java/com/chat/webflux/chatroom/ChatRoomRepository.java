package com.chat.webflux.chatroom;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

/*
 채팅방(ChatRoom) 엔티티에 대한 데이터베이스 접근(Data Access)을 처리하는 리포지토리 인터페이스
 ReactiveMongoRepository를 상속받아 기본적인 CRUD 및 페이징/정렬 기능을 비동기(Reactive) 방식으로 자동 구현
*/

@Repository
public interface ChatRoomRepository extends ReactiveMongoRepository<ChatRoom, String> {
    /*
      'members' 필드에 특정 사용자 ID(username)가 포함된 모든 채팅방을 조회
      MongoDB가 메서드 이름을 기반으로 쿼리를 자동 생성
      특정 유저가 속한 모든 채팅방 목록을 조회할 때 사용
     */
    Flux<ChatRoom> findByMembersContaining(String username);
}