package com.chat.webflux.user;

import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.chatroom.ChatRoomService;
import com.chat.webflux.presence.PresenceService;
import com.chat.webflux.unread.UnreadCountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomService chatRoomService;
    private final UnreadCountRepository unreadCountRepository;
    private final PresenceService presenceService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    // signup 메서드에 nickname 파라미터 추가
    public Mono<User> signup(String username, String password, String nickname) {
        // 닉네임이 비어있으면 아이디로 초기화
        final String finalNickname = (nickname == null || nickname.isBlank()) ? username : nickname;

        return userRepository.findByUsername(username)
                .flatMap(existingUser -> Mono.<User>error(new IllegalArgumentException("이미 사용 중인 아이디입니다.")))
                .switchIfEmpty(Mono.defer(() -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setNickname(finalNickname); // 전달받은 닉네임으로 설정
                    user.setPassword(passwordEncoder.encode(password));
                    return userRepository.save(user);
                }));
    }

    public Mono<User> login(String username, String password) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("사용자를 찾을 수 없습니다.")))
                .flatMap(user -> {
                    if (passwordEncoder.matches(password, user.getPassword())) {
                        return Mono.just(user);
                    } else {
                        return Mono.error(new IllegalArgumentException("비밀번호가 일치하지 않습니다."));
                    }
                });
    }

    public Mono<User> addFriend(String currentUsername, String friendUsername) {
        if (currentUsername.equals(friendUsername)) {
            return Mono.error(new IllegalArgumentException("자기 자신을 친구로 추가할 수 없습니다."));
        }
        Mono<User> friendMono = userRepository.findByUsername(friendUsername)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 사용자입니다.")));
        Mono<User> currentUserMono = userRepository.findByUsername(currentUsername);

        return Mono.zip(currentUserMono, friendMono)
                .flatMap(tuple -> {
                    User currentUser = tuple.getT1();
                    User friend = tuple.getT2();
                    if (currentUser.getFriendUsernames().contains(friend.getUsername())) {
                        return Mono.error(new IllegalArgumentException("이미 추가된 친구입니다."));
                    }
                    currentUser.getFriendUsernames().add(friend.getUsername());
                    return userRepository.save(currentUser);
                });
    }

    public Flux<User> getFriends(String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("사용자를 찾을 수 없습니다.")))
                .flatMapMany(user -> {
                    if (user.getFriendUsernames() == null || user.getFriendUsernames().isEmpty()) {
                        return Flux.empty();
                    }
                    return userRepository.findByUsernameIn(user.getFriendUsernames());
                });
    }

    public Mono<User> findByUsername(String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("User not found")));
    }

    public Mono<User> updateProfile(String currentUsername, String newNickname, Mono<FilePart> filePartMono) {
        return userRepository.findByUsername(currentUsername)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("사용자를 찾을 수 없습니다.")))
                .flatMap(user -> {
                    Mono<User> userWithUpdatedImage = filePartMono
                            .flatMap(filePart -> {
                                Path profileUploadPath = Paths.get(uploadDir, "profiles");
                                try {
                                    Files.createDirectories(profileUploadPath);
                                } catch (IOException e) {
                                    return Mono.error(new RuntimeException("프로필 업로드 폴더를 생성할 수 없습니다.", e));
                                }
                                String originalFilename = filePart.filename();
                                String extension = "";
                                int i = originalFilename.lastIndexOf('.');
                                if (i > 0) {
                                    extension = originalFilename.substring(i);
                                }
                                String uuidFileName = UUID.randomUUID().toString() + extension;
                                Path path = profileUploadPath.resolve(uuidFileName);

                                return filePart.transferTo(path).then(Mono.fromCallable(() -> {
                                    user.setProfilePictureUrl("/uploads/profiles/" + uuidFileName);
                                    return user;
                                }));
                            })
                            .defaultIfEmpty(user);

                    return userWithUpdatedImage.flatMap(updatedUser -> {
                        updatedUser.setNickname(newNickname);
                        return userRepository.save(updatedUser);
                    });
                });
    }
    public Mono<Void> deleteUser(String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("사용자를 찾을 수 없습니다.")))
                .flatMap(user -> {

                    // 1. 이 유저가 속한 모든 채팅방에서 나가기
                    Mono<Void> leaveRooms = chatRoomRepository.findByMembersContaining(username)
                            .flatMap(room -> chatRoomService.leaveChatRoom(room.getId(), username))
                            .then();

                    // 2. 다른 유저의 '친구 목록'에서 나를 삭제
                    Mono<Void> removeFromFriends = userRepository.findAllByFriendUsernamesContaining(username)
                            .flatMap(friend -> {
                                log.info("[USER DELETE] 친구 '{}'의 목록에서 '{}'를 삭제합니다.", friend.getUsername(), username);
                                friend.getFriendUsernames().remove(username);
                                log.info("[USER DELETE] '{}'에게 '{}'의 'DELETED' 상태 전송 시도.", friend.getUsername(), username);
                                presenceService.broadcastStatusUpdate(friend.getUsername(), username, "DELETED");
                                return userRepository.save(friend);
                            })
                            .then();

                    // 3. 이 유저의 '안 읽은 카운트' 정보 모두 삭제
                    Mono<Void> deleteUnreadCounts = unreadCountRepository.deleteAllByUserId(username);

                    // 4. 모든 작업(1,2,3)이 완료된 후, 유저 정보 최종 삭제
                    return Mono.when(leaveRooms, removeFromFriends, deleteUnreadCounts)
                            .then(userRepository.delete(user));
                });
    }
}