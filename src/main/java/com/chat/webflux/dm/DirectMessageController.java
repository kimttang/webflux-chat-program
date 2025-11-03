package com.chat.webflux.dm;

import com.chat.webflux.chatroom.ChatRoom;
import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.chatroom.ChatRoomService;
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
import org.springframework.dao.DuplicateKeyException;


// 1:1 다이렉트 메시지(DM) 관련 API 요청을 처리하는 컨트롤러
@RestController
@RequestMapping("/api/dm")
@RequiredArgsConstructor
public class DirectMessageController {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository; // UserRepository 의존성 추가

    // 1:1 채팅 시작(POST) 요청 시 프론트엔드가 보낼 JSON 본문을 매핑하기 위한 DTO
    @Getter
    @Setter
    private static class DmRequest {
        private String fromUser;
        private String toUser;
    }

    // 1:1 채팅방을 "찾거나" "생성"
    @PostMapping("/start")
    public Mono<ChatRoom> startDirectMessage(@RequestBody DmRequest dmRequest) {
        String fromUser = dmRequest.getFromUser();
        String toUser = dmRequest.getToUser();

        // 1. 고유 ID 생성
        String roomId = Arrays.stream(new String[]{fromUser, toUser})
                .sorted()
                .collect(Collectors.joining("-"));

        // 2. 닉네임 조합
        Mono<User> fromUserMono = userRepository.findByUsername(fromUser);
        Mono<User> toUserMono = userRepository.findByUsername(toUser);

        // 3. 두 사용자 정보가 모두 로드되면 로직을 실행
        return Mono.zip(fromUserMono, toUserMono)
                .flatMap(tuple -> {
                    User user1 = tuple.getT1();
                    User user2 = tuple.getT2();

                    // 4. 두 사용자의 닉네임으로 채팅방 이름을 생성
                    String roomName = String.format("%s & %s", user1.getNickname(), user2.getNickname());

                    // 5. 경쟁 상태(Race Condition) 방어 로직
                    return chatRoomRepository.findById(roomId)
                            .switchIfEmpty(Mono.defer(() -> {
                                ChatRoom newRoom = new ChatRoom(roomId, roomName, fromUser, toUser);
                                return chatRoomRepository.save(newRoom)
                                        .doOnSuccess(room -> chatRoomService.broadcastToAllMembers(room))

                                        .onErrorResume(DuplicateKeyException.class, e ->
                                                chatRoomRepository.findById(roomId)
                                        );
                            }));
                })
                // 6. Mono.zip 단계에서 사용자 정보를 찾지 못한 경우
                .switchIfEmpty(Mono.error(new RuntimeException("DM_CREATE_USER_NOT_FOUND_ERROR")));
    }
}