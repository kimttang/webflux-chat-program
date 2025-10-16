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

    @Getter
    @Setter
    private static class CreateRoomRequest {
        private String name;
        private String username;
    }

    @PostMapping
    public Mono<ChatRoom> createChatRoom(@RequestBody CreateRoomRequest request) {
        return chatRoomService.createChatRoom(request.getName(), request.getUsername());
    }

    @Getter
    @Setter
    private static class InviteRequest {
        private String usernameToInvite;
        private String invitedBy;
    }

    @PostMapping("/{roomId}/invite")
    public Mono<ChatRoom> inviteUser(@PathVariable String roomId, @RequestBody InviteRequest request) {
        return chatRoomService.inviteUserToChatRoom(roomId, request.getUsernameToInvite(), request.getInvitedBy());
    }

    @Getter
    @Setter
    private static class LeaveRequest {
        private String username;
    }

    @GetMapping("/{roomId}/members")
    public Flux<User> getRoomMembers(@PathVariable String roomId) {
        return chatRoomService.getChatRoomMembers(roomId);
    }

    @PostMapping("/{roomId}/leave")
    public Mono<Void> leaveRoom(@PathVariable String roomId, @RequestBody LeaveRequest request) {
        return chatRoomService.leaveChatRoom(roomId, request.getUsername());
    }

    private Mono<String> convertListToJson(List<ChatRoom> list) {
        try {
            return Mono.just(objectMapper.writeValueAsString(list));
        } catch (JsonProcessingException e) {
            return Mono.error(e);
        }
    }
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