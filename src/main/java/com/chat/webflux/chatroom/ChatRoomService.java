package com.chat.webflux.chatroom;

import com.chat.webflux.dto.ChatRoomDto;
import com.chat.webflux.handler.ChatWebSocketHandler;
import com.chat.webflux.message.ChatMessageRepository;
import com.chat.webflux.unread.UnreadCount;
import com.chat.webflux.unread.UnreadCountRepository;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;


/*
 채팅방 관련 비즈니스 로직을 처리하는 서비스 클래스
 실시간 채팅방 목록 SSE 스트림 관리
 채팅방 생성, 초대, 나가기, 프로필 변경 로직 수행
*/

@Service
//@RequiredArgsConstructor // 수동 생성자 주입을 사용하기 위해 주석 처리됨
public class ChatRoomService {

    // --- 의존성 주입 ---
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UnreadCountRepository unreadCountRepository;
    private final UserRepository userRepository;
    private final ChatWebSocketHandler chatWebSocketHandler;
    @Value("${file.upload-dir}")
    private String uploadDir;

    private final Map<String, Sinks.Many<List<ChatRoomDto>>> userChatRoomSinks = new ConcurrentHashMap<>();

    //새 그룹 채팅방을 생성
    public Mono<ChatRoom> createChatRoom(String name, String createdBy) {
        ChatRoom chatRoom = new ChatRoom(name, createdBy);
        return chatRoomRepository.save(chatRoom)
                // .doOnSuccess: DB 저장이 성공하면,
                // 이 방의 멤버들(현재는 생성자 1명)에게 SSE로 목록 갱신을 전파
                .doOnSuccess(this::broadcastToAllMembers);
    }

    //특정 사용자를 위한 SSE Sink(파이프라인)를 가져오거나 생성
    private Sinks.Many<List<ChatRoomDto>> getOrCreateSink(String username) {
        return userChatRoomSinks.computeIfAbsent(username, u ->
                Sinks.many().replay().latestOrDefault(new ArrayList<>()));
    }

    //순환 참조(Circular Dependency)를 해결하기 위한 수동 생성자
    public ChatRoomService(ChatRoomRepository chatRoomRepository,
                           ChatMessageRepository chatMessageRepository,
                           UnreadCountRepository unreadCountRepository,
                           UserRepository userRepository,
                           @Lazy ChatWebSocketHandler chatWebSocketHandler) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.unreadCountRepository = unreadCountRepository;
        this.userRepository = userRepository;
        this.chatWebSocketHandler = chatWebSocketHandler;
    }

    //특정 사용자(username)의 "채팅방 목록 DTO"를 "최신 상태로" 갱신하여 SSE로 전송
    public void broadcastRoomListToUser(String username) {
        // 1. 먼저 사용자의 모든 '안 읽은 메시지 수' 정보를 Map 형태로 가져옴
        Mono<Map<String, Integer>> unreadCountsMapMono = unreadCountRepository.findByUserId(username)
                .collectMap(UnreadCount::getRoomId, UnreadCount::getCount);

        unreadCountsMapMono.flatMap(unreadCountsMap ->
                        // 2. 그 다음, 사용자가 속한 채팅방 목록을 가져옴
                        chatRoomRepository.findByMembersContaining(username)
                                .collectList()
                                .flatMap(rooms ->
                                        // 3. 각 채팅방의 마지막 메시지를 찾고, 안 읽은 메시지 수를 포함하여 DTO를 생성
                                        Flux.fromIterable(rooms)
                                                .flatMap(room -> {
                                                    // 현재 방의 안 읽은 메시지 수를 조회(없으면 0)
                                                    int unreadCount = unreadCountsMap.getOrDefault(room.getId(), 0);

                                                    return chatMessageRepository.findTopByRoomIdOrderByCreatedAtDesc(room.getId())
                                                            .map(message -> new ChatRoomDto(room, message, unreadCount))
                                                            .defaultIfEmpty(new ChatRoomDto(room, null, unreadCount));
                                                })
                                                .collectList()
                                )
                )
                .doOnSuccess(chatRoomDtos -> {
                    // 4. DTO 리스트를 마지막 메시지 시간 순으로 정렬
                    chatRoomDtos.sort((dto1, dto2) -> {
                        // 정렬 기준 시간 (1순위: 마지막 메시지 시간, 2순위: 채팅방 생성 시간)
                        Instant time1 = (dto1.getLastMessage() != null)
                                ? dto1.getLastMessage().getCreatedAt()
                                : dto1.getRoomCreatedAt();

                        Instant time2 = (dto2.getLastMessage() != null)
                                ? dto2.getLastMessage().getCreatedAt()
                                : dto2.getRoomCreatedAt();

                        // null 체크 (데이터 안정성)
                        if (time1 == null && time2 == null) return 0;
                        if (time1 == null) return 1;
                        if (time2 == null) return -1;

                        // 최신 시간이 위로 오도록 내림차순 정렬
                        return time2.compareTo(time1);
                    });

                    // 5. 정렬된 최종 목록을 사용자에게 전송
                    Sinks.Many<List<ChatRoomDto>> sink = getOrCreateSink(username);
                    sink.tryEmitNext(chatRoomDtos);
                })
                .subscribe();
    }

    //특정 사용자의 채팅방 목록 SSE 스트림을 "구독"하는 API 엔드포인트
    public Flux<List<ChatRoomDto>> getChatRoomUpdates(String username) {
        return getOrCreateSink(username).asFlux()
                .doOnSubscribe(subscription -> broadcastRoomListToUser(username));
    }

    //특정 채팅방(room)의 "모든 멤버"에게 SSE 목록 갱신을 전파
    public void broadcastToAllMembers(ChatRoom room) {
        room.getMembers().forEach(this::broadcastRoomListToUser);
    }

    //특정 채팅방에 속한 모든 멤버(User)의 상세 정보를 조회
    public Flux<User> getChatRoomMembers(String roomId) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("CHATROOM_NOT_FOUND_ERROR")))
                .flatMapMany(chatRoom -> {
                    Set<String> memberUsernames = chatRoom.getMembers();
                    if (memberUsernames == null || memberUsernames.isEmpty()) {
                        return Flux.empty();
                    }
                    // Set을 List로 변환하여 userRepository에 전달
                    return userRepository.findByUsernameIn(new ArrayList<>(memberUsernames));
                });
    }

    public Mono<ChatRoom> inviteUserToChatRoom(String roomId, String usernameToInvite, String invitedBy) {
        // 1. 채팅방 정보와 초대할 사용자의 정보를 동시에 DB에서 가져옴
        Mono<ChatRoom> chatRoomMono = chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("CHATROOM_NOT_FOUND_ERROR")));
        Mono<User> userToInviteMono = userRepository.findByUsername(usernameToInvite)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("INVITE_USER_NOT_FOUND_ERROR")));

        // 2. Mono.zip을 사용해 두 정보가 모두 로딩되면 다음 로직을 실행
        return Mono.zip(chatRoomMono, userToInviteMono)
                .flatMap(tuple -> {
                    ChatRoom currentRoom = tuple.getT1();
                    User userToInvite = tuple.getT2();

                    // 3. [Validation]
                    if (!currentRoom.getMembers().contains(invitedBy)) {
                        return Mono.error(new SecurityException("INVITE_PERMISSION_DENIED_ERROR"));
                    }
                    if (currentRoom.getMembers().contains(usernameToInvite)) {
                        return Mono.error(new IllegalArgumentException("INVITE_USER_ALREADY_IN_ROOM_ERROR"));
                    }

                    // 4. [THE CORE FIX] 현재 방이 DM 방인지 확인
                    if (currentRoom.isDm()) {
                        // 5. [FIX: Path A] DM 방이 맞습니다.
                        // "새로운" 그룹 채팅방을 생성합니다.

                        // 5a. 새 방의 멤버 목록을 준비합니다. (기존 멤버 + 새 멤버)
                        Set<String> newRoomMembers = new HashSet<>(currentRoom.getMembers());
                        newRoomMembers.add(usernameToInvite); // [A, B, C]

                        // 5b. 새 방의 이름을 만들기 위해 모든 멤버의 닉네임을 조회합니다.
                        return userRepository.findByUsernameIn(new ArrayList<>(newRoomMembers))
                                .map(User::getNickname)
                                .collect(Collectors.joining(" & "))
                                .flatMap(newRoomName -> {
                                    // 5c. 새 그룹방 객체를 생성하고 저장합니다.
                                    ChatRoom newGroupRoom = new ChatRoom();
                                    // (ID는 MongoDB가 자동으로 생성하도록 null로 둡니다)
                                    newGroupRoom.setName(newRoomName);
                                    newGroupRoom.setMembers(newRoomMembers);
                                    newGroupRoom.setCreatedAt(Instant.now());
                                    newGroupRoom.setDm(false); // 👈 이것은 그룹 채팅방입니다.

                                    return chatRoomRepository.save(newGroupRoom);
                                })
                                // 5d. 새 방의 모든 멤버에게 목록 갱신을 알립니다.
                                .doOnSuccess(this::broadcastToAllMembers);

                    } else {
                        // 6. [FIX: Path B] 이미 그룹 채팅방입니다.
                        // 기존 로직대로 현재 방에 멤버만 추가합니다.
                        currentRoom.getMembers().add(usernameToInvite);

                        // 7. 변경된 멤버 목록을 DB에 저장
                        return chatRoomRepository.save(currentRoom)
                                // 8. 현재 방의 모든 멤버에게 갱신을 알립니다.
                                .doOnSuccess(this::broadcastToAllMembers);
                    }
                });
    }

    //채팅방에서 나간 후 남은 인원에 따라 방을 삭제하거나, 이름을 변경
    public Mono<Void> leaveChatRoom(String roomId, String username) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("CHATROOM_NOT_FOUND_ERROR")))
                .flatMap(chatRoom -> {
                    if (!chatRoom.getMembers().contains(username)) {
                        return Mono.error(new SecurityException("LEAVE_ROOM_NOT_MEMBER_ERROR"));
                    }

                    // 1. [중요] 방이 삭제되기 전, "모든" 멤버(A와 B) 목록을 미리 확보합니다.
                    Set<String> allMembers = new HashSet<>(chatRoom.getMembers());

                    return userRepository.findByUsername(username)
                            .flatMap(leavingUser -> {
                                // 2. 나가는 사용자를 제외한 나머지 멤버 목록 생성
                                Set<String> remainingMembers = chatRoom.getMembers().stream()
                                        .filter(member -> !member.equals(username))
                                        .collect(Collectors.toSet());

                                boolean isDmRoom = chatRoom.isDm();

                                // 3. 방 삭제 조건 확인
                                if (remainingMembers.isEmpty() || (isDmRoom && remainingMembers.size() == 1)) {

                                    // 4. [핵심 수정] "상대방(B)"의 카운트를 포함하여 *모든 멤버*의 카운트를 "찾아서" 삭제합니다.
                                    Mono<Void> deleteAllUnreadCounts = Flux.fromIterable(allMembers)
                                            .flatMap(memberUsername ->
                                                    // (1) "A"의 카운트 *찾기*, "B"의 카운트 *찾기*
                                                    unreadCountRepository.findByUserIdAndRoomId(memberUsername, roomId)
                                            )
                                            .flatMap(unreadCountDoc ->
                                                    // (2) 찾은 문서를 *삭제*
                                                    unreadCountRepository.delete(unreadCountDoc)
                                            ).then(); // (모든 삭제가 끝날 때까지 대기)

                                    // 5. 모든 unread_counts가 삭제된 *후에* 메시지와 채팅방을 삭제합니다.
                                    return deleteAllUnreadCounts
                                            .then(chatMessageRepository.deleteByRoomId(roomId))
                                            .then(chatRoomRepository.delete(chatRoom))
                                            .then(Mono.fromRunnable(() -> {
                                                // 6. 나간 사람과, 마지막으로 남았던 사람 모두에게 목록 업데이트를 알려줌
                                                allMembers.forEach(this::broadcastRoomListToUser);
                                            }));
                                } else {
                                    // [정상] (방이 삭제되지 않는 경우)
                                    chatRoom.setMembers(remainingMembers);

                                    if (chatRoom.getName().contains(" & ")) {
                                        List<String> currentNicknames = new ArrayList<>(Arrays.asList(chatRoom.getName().split(" & ")));
                                        currentNicknames.remove(leavingUser.getNickname());
                                        String newName = String.join(" & ", currentNicknames);
                                        chatRoom.setName(newName);
                                    }

                                    return chatRoomRepository.save(chatRoom)
                                            .doOnSuccess(updatedRoom -> {
                                                broadcastToAllMembers(updatedRoom);
                                                broadcastRoomListToUser(username);
                                            }).then();
                                }
                            });
                });
    }
    //채팅방의 프로필 정보(이름, 프로필 사진)를 수정
    public Mono<ChatRoom> updateChatRoomProfile(String roomId, String newName, Mono<FilePart> filePartMono) {
        return chatRoomRepository.findById(roomId)
                .flatMap(chatRoom -> {
                    // 파일이 업로드되었는지 확인하고 처리하는 Mono
                    Mono<ChatRoom> roomWithUpdatedImage = filePartMono
                            .flatMap(filePart -> {
                                // 프로필 사진 저장 경로 설정
                                Path profileUploadPath = Paths.get(uploadDir, "profiles");
                                try {
                                    Files.createDirectories(profileUploadPath);
                                } catch (IOException e) {
                                    return Mono.error(new RuntimeException("PROFILE_UPLOAD_DIR_ERROR", e));
                                }

                                // 고유한 파일명 생성
                                String originalFilename = filePart.filename();
                                String extension = "";
                                int i = originalFilename.lastIndexOf('.');
                                if (i > 0) {
                                    extension = originalFilename.substring(i);
                                }
                                String uuidFileName = UUID.randomUUID().toString() + extension;
                                Path path = profileUploadPath.resolve(uuidFileName);

                                // 파일을 서버에 저장하고, 성공하면 ChatRoom 객체에 URL 업데이트
                                return filePart.transferTo(path).then(Mono.fromCallable(() -> {
                                    chatRoom.setProfilePictureUrl("/uploads/profiles/" + uuidFileName);
                                    return chatRoom;
                                }));
                            })
                            .defaultIfEmpty(chatRoom); // 파일이 없으면 기존 chatRoom 객체를 그대로 사용

                    // 이름 변경 및 최종적으로 DB에 저장
                    return roomWithUpdatedImage.flatMap(updatedRoom -> {
                        updatedRoom.setName(newName);
                        return chatRoomRepository.save(updatedRoom);
                    });
                })
                .doOnSuccess(this::broadcastToAllMembers); // 성공 시, 변경된 정보를 모든 멤버에게 실시간 전파
    }

}