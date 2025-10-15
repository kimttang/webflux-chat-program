package com.chat.webflux.dm;

import com.chat.webflux.chatroom.ChatRoom;
import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.chatroom.ChatRoomService;
// 아래 두 라인을 추가하거나 확인해주세요.
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dm")
@RequiredArgsConstructor
public class DirectMessageController {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository; // UserRepository 의존성 추가

    @Getter
    @Setter
    private static class DmRequest {
        private String fromUser;
        private String toUser;
    }

    @PostMapping("/start")
    public Mono<ChatRoom> startDirectMessage(@RequestBody DmRequest dmRequest) {
        String fromUser = dmRequest.getFromUser();
        String toUser = dmRequest.getToUser();

        String roomId = Arrays.stream(new String[]{fromUser, toUser})
                .sorted()
                .collect(Collectors.joining("&"));

        // 두 사용자의 정보를 DB에서 조회
        Mono<User> fromUserMono = userRepository.findByUsername(fromUser);
        Mono<User> toUserMono = userRepository.findByUsername(toUser);

        // Mono.zip을 사용하여 두 Mono가 모두 완료될 때까지 기다림
        return Mono.zip(fromUserMono, toUserMono)
                .flatMap(tuple -> {
                    User user1 = tuple.getT1();
                    User user2 = tuple.getT2();

                    // 아이디 대신 닉네임으로 채팅방 이름 설정
                    String roomName = String.format("%s & %s", user1.getNickname(), user2.getNickname());

                    // 기존 로직 수행
                    return chatRoomRepository.findById(roomId)
                            .switchIfEmpty(Mono.defer(() -> {
                                ChatRoom newRoom = new ChatRoom(roomId, roomName, fromUser, toUser);
                                return chatRoomRepository.save(newRoom)
                                        .doOnSuccess(room -> chatRoomService.broadcastToAllMembers(room));
                            }));
                });
    }
}