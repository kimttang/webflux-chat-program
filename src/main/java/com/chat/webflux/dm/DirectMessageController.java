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
                .collect(Collectors.joining("-"));

        Mono<User> fromUserMono = userRepository.findByUsername(fromUser);
        Mono<User> toUserMono = userRepository.findByUsername(toUser);

        return Mono.zip(fromUserMono, toUserMono)
                .flatMap(tuple -> {
                    User user1 = tuple.getT1();
                    User user2 = tuple.getT2();

                    String roomName = String.format("%s & %s", user1.getNickname(), user2.getNickname());

                    // 3. [수정] "경쟁 상태" 방지 로직
                    return chatRoomRepository.findById(roomId)
                            .switchIfEmpty(Mono.defer(() -> {
                                // 3-1. (시도) 방이 없으므로 "새로 저장"
                                ChatRoom newRoom = new ChatRoom(roomId, roomName, fromUser, toUser);
                                return chatRoomRepository.save(newRoom)
                                        .doOnSuccess(room -> chatRoomService.broadcastToAllMembers(room))

                                        // 3-2. (방어) "중복 키 오류"가 나면 (즉, 동시에 생성됐다면)
                                        .onErrorResume(DuplicateKeyException.class, e ->
                                                // 3-3. 이미 생성된 그 방을 "다시 조회"해서 반환
                                                chatRoomRepository.findById(roomId)
                                        );
                            }));
                })
                .switchIfEmpty(Mono.error(new RuntimeException("1:1 채팅 생성 실패: 사용자 정보를 찾을 수 없습니다.")));
    }
}