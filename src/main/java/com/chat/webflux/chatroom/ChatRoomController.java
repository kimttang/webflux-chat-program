package com.chat.webflux.chatroom;

import com.chat.webflux.dto.ChatRoomDto;
import com.chat.webflux.user.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

    // 채팅방(ChatRoom)의 CRUD 및 멤버 관리 API 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/api/chatrooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ObjectMapper objectMapper;

    @GetMapping(value = "/{username}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<List<ChatRoomDto>> getChatRoomStream(@PathVariable String username) {
        return chatRoomService.getChatRoomUpdates(username);
    }

    //(CREATE) 새 그룹 채팅방 생성을 위한 DTO
    @Getter
    @Setter
    private static class CreateRoomRequest {
        private String name;
        private String username;
    }

    //(CREATE) 새 그룹 채팅방을 생성
    @PostMapping
    public Mono<ChatRoom> createChatRoom(@RequestBody CreateRoomRequest request) {
        return chatRoomService.createChatRoom(request.getName(), request.getUsername());
    }

    //채팅방 초대(UPDATE)를 위한 DTO
    @Getter
    @Setter
    private static class InviteRequest {
        private String usernameToInvite;
        private String invitedBy;
    }

    //(UPDATE) 기존 채팅방에 다른 사용자를 초대
    @PostMapping("/{roomId}/invite")
    public Mono<ChatRoom> inviteUser(@PathVariable String roomId, @RequestBody InviteRequest request) {
        return chatRoomService.inviteUserToChatRoom(roomId, request.getUsernameToInvite(), request.getInvitedBy());
    }

    //채팅방 나가기(UPDATE)를 위한 DTO
    @Getter
    @Setter
    private static class LeaveRequest {
        private String username;
    }

    //(READ) 특정 채팅방에 속한 모든 멤버(User) 목록을 조회
    @GetMapping("/{roomId}/members")
    public Flux<User> getRoomMembers(@PathVariable String roomId) {
        return chatRoomService.getChatRoomMembers(roomId);
    }

    //(UPDATE) 채팅방에서 나갑니다.
    @PostMapping("/{roomId}/leave")
    public Mono<Void> leaveRoom(@PathVariable String roomId, @RequestBody LeaveRequest request) {
        return chatRoomService.leaveChatRoom(roomId, request.getUsername());
    }

    //ChatRoom 리스트를 JSON 문자열로 변환하는 헬퍼 메서드
    private Mono<String> convertListToJson(List<ChatRoom> list) {
        try {
            return Mono.just(objectMapper.writeValueAsString(list));
        } catch (JsonProcessingException e) {
            return Mono.error(e);
        }
    }

    //(UPDATE) 채팅방의 프로필 정보(이름, 프로필 사진)를 수정
    @PostMapping("/{roomId}/profile")
    public Mono<ResponseEntity<ChatRoom>> updateChatRoomProfile(
            @PathVariable String roomId,
            @RequestPart("newName") String newName,
            @RequestPart(name = "profileImage", required = false) Mono<FilePart> filePartMono) {

        return chatRoomService.updateChatRoomProfile(roomId, newName, filePartMono)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}