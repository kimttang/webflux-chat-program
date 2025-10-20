package com.chat.webflux.chatroom;

import org.springframework.context.annotation.Lazy;
import com.chat.webflux.dto.ChatRoomDto;
import com.chat.webflux.handler.ChatWebSocketHandler;
import com.chat.webflux.message.ChatMessageRepository;
import com.chat.webflux.unread.UnreadCountRepository;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
//import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import com.chat.webflux.unread.UnreadCount;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
//@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UnreadCountRepository unreadCountRepository;
    private final UserRepository userRepository;
    private final ChatWebSocketHandler chatWebSocketHandler;
    @Value("${file.upload-dir}")
    private String uploadDir;

    private final Map<String, Sinks.Many<List<ChatRoomDto>>> userChatRoomSinks = new ConcurrentHashMap<>();

    public Mono<ChatRoom> createChatRoom(String name, String createdBy) {
        ChatRoom chatRoom = new ChatRoom(name, createdBy);
        return chatRoomRepository.save(chatRoom)
                .doOnSuccess(this::broadcastToAllMembers);
    }

    private Sinks.Many<List<ChatRoomDto>> getOrCreateSink(String username) {
        return userChatRoomSinks.computeIfAbsent(username, u ->
                Sinks.many().replay().latestOrDefault(new ArrayList<>()));
    }

    public ChatRoomService(ChatRoomRepository chatRoomRepository,
                           ChatMessageRepository chatMessageRepository,
                           UnreadCountRepository unreadCountRepository,
                           UserRepository userRepository,
                           @Lazy ChatWebSocketHandler chatWebSocketHandler) { // <--- @Lazy 추가
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.unreadCountRepository = unreadCountRepository;
        this.userRepository = userRepository;
        this.chatWebSocketHandler = chatWebSocketHandler;
    }
    public void broadcastRoomListToUser(String username) {
        // 1. 먼저 사용자의 모든 '안 읽은 메시지 수' 정보를 Map 형태로 가져옵니다.
        Mono<Map<String, Integer>> unreadCountsMapMono = unreadCountRepository.findByUserId(username)
                .collectMap(UnreadCount::getRoomId, UnreadCount::getCount);

        unreadCountsMapMono.flatMap(unreadCountsMap ->
                        // 2. 그 다음, 사용자가 속한 채팅방 목록을 가져옵니다.
                        chatRoomRepository.findByMembersContaining(username)
                                .collectList()
                                .flatMap(rooms ->
                                        // 3. 각 채팅방의 마지막 메시지를 찾고, 안 읽은 메시지 수를 포함하여 DTO를 생성합니다.
                                        Flux.fromIterable(rooms)
                                                .flatMap(room -> {
                                                    // 1단계에서 만든 Map에서 현재 방의 안 읽은 메시지 수를 조회합니다. (없으면 0)
                                                    int unreadCount = unreadCountsMap.getOrDefault(room.getId(), 0);

                                                    return chatMessageRepository.findTopByRoomIdOrderByCreatedAtDesc(room.getId())
                                                            // ✨ 수정된 ChatRoomDto 생성자를 사용합니다.
                                                            .map(message -> new ChatRoomDto(room, message, unreadCount))
                                                            .defaultIfEmpty(new ChatRoomDto(room, null, unreadCount));
                                                })
                                                .collectList()
                                )
                )
                .doOnSuccess(chatRoomDtos -> {
                    // 4. DTO 리스트를 마지막 메시지 시간 순으로 정렬합니다. (기존 로직과 동일)
                    chatRoomDtos.sort((dto1, dto2) -> {
                        // 정렬 기준 시간 (1순위: 마지막 메시지 시간, 2순위: 채팅방 생성 시간)
                        LocalDateTime time1 = (dto1.getLastMessage() != null)
                                ? dto1.getLastMessage().getCreatedAt()
                                : dto1.getRoomCreatedAt(); // 1단계에서 DTO에 추가한 필드 사용

                        LocalDateTime time2 = (dto2.getLastMessage() != null)
                                ? dto2.getLastMessage().getCreatedAt()
                                : dto2.getRoomCreatedAt(); // 1단계에서 DTO에 추가한 필드 사용

                        // null 체크 (데이터 안정성)
                        if (time1 == null && time2 == null) return 0;
                        if (time1 == null) return 1; // null이 뒤로
                        if (time2 == null) return -1; // null이 뒤로

                        // 최신 시간이 위로 오도록 내림차순 정렬
                        return time2.compareTo(time1);
                    });

                    // 5. 정렬된 최종 목록을 사용자에게 전송(broadcast)합니다. (기존 로직과 동일)
                    Sinks.Many<List<ChatRoomDto>> sink = getOrCreateSink(username);
                    sink.tryEmitNext(chatRoomDtos);
                })
                .subscribe();
    }

    public Flux<List<ChatRoomDto>> getChatRoomUpdates(String username) {
        return getOrCreateSink(username).asFlux()
                .doOnSubscribe(subscription -> broadcastRoomListToUser(username));
    }

    public void broadcastToAllMembers(ChatRoom room) {
        room.getMembers().forEach(this::broadcastRoomListToUser);
    }

    public Flux<User> getChatRoomMembers(String roomId) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 채팅방입니다.")))
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
        // 1. 채팅방 정보와 초대할 사용자의 정보를 동시에 DB에서 가져옵니다.
        Mono<ChatRoom> chatRoomMono = chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 채팅방입니다.")));
        Mono<User> userToInviteMono = userRepository.findByUsername(usernameToInvite)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("초대할 사용자를 찾을 수 없습니다.")));

        // 2. Mono.zip을 사용해 두 정보가 모두 로딩되면 다음 로직을 실행합니다.
        return Mono.zip(chatRoomMono, userToInviteMono)
                .flatMap(tuple -> {
                    ChatRoom chatRoom = tuple.getT1();
                    User userToInvite = tuple.getT2();

                    // (기존 유효성 검사는 그대로 유지)
                    if (!chatRoom.getMembers().contains(invitedBy)) {
                        return Mono.error(new SecurityException("초대 권한이 없습니다."));
                    }
                    if (chatRoom.getMembers().contains(usernameToInvite)) {
                        return Mono.error(new IllegalArgumentException("이미 채팅방에 참여하고 있는 사용자입니다."));
                    }

                    // 3. 멤버 목록에 새로운 사용자를 추가합니다.
                    chatRoom.getMembers().add(usernameToInvite);

                    // 4. ✨핵심✨: 채팅방 이름에 초대된 사용자의 닉네임을 추가합니다.
                    // 기존 이름에 " & "와 새로운 닉네임을 붙여줍니다.
                    chatRoom.setName(chatRoom.getName() + " & " + userToInvite.getNickname());

                    // 5. 변경된 멤버 목록과 이름을 DB에 저장합니다.
                    return chatRoomRepository.save(chatRoom);
                })
                .doOnSuccess(this::broadcastToAllMembers); // 성공 시 모든 멤버에게 변경사항을 알립니다.
    }

    public Mono<Void> leaveChatRoom(String roomId, String username) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 채팅방입니다.")))
                .flatMap(chatRoom -> {
                    if (!chatRoom.getMembers().contains(username)) {
                        return Mono.error(new SecurityException("당신은 이 채팅방의 멤버가 아닙니다."));
                    }

                    return userRepository.findByUsername(username)
                            .flatMap(leavingUser -> {
                                // 나가는 사용자를 제외한 나머지 멤버 목록 생성
                                Set<String> remainingMembers = chatRoom.getMembers().stream()
                                        .filter(member -> !member.equals(username))
                                        .collect(Collectors.toSet());

                                // --- ✅ 핵심 수정 사항: 삭제 조건 확장 ---
                                // 1. 이 방이 원래 DM방이었는지 확인 (ID에 '-'가 있으면 DM방)
                                boolean isDmOriginated = chatRoom.getId().contains("-");

                                // 2. 새로운 삭제 조건:
                                //    - 멤버가 0명이 되거나 (기존 조건)
                                //    - 또는, DM방이었는데 멤버가 1명만 남게 될 경우
                                if (remainingMembers.isEmpty() || (isDmOriginated && remainingMembers.size() == 1)) {

                                    // 채팅방과 관련된 모든 데이터(메시지, 안읽음 카운트)를 삭제합니다.
                                    return chatMessageRepository.deleteByRoomId(roomId)
                                            .then(unreadCountRepository.deleteByRoomId(roomId))
                                            .then(chatRoomRepository.delete(chatRoom))
                                            .then(Mono.fromRunnable(() -> {
                                                // 나간 사람과, 마지막으로 남았던 사람 모두에게 목록 업데이트를 알려줍니다.
                                                broadcastRoomListToUser(username);
                                                if (!remainingMembers.isEmpty()) {
                                                    remainingMembers.forEach(this::broadcastRoomListToUser);
                                                }
                                            }));
                                } else {
                                    // --- (남은 멤버가 2명 이상인 경우, 기존 이름 업데이트 로직 유지) ---
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
                                    return Mono.error(new RuntimeException("프로필 업로드 폴더를 생성할 수 없습니다.", e));
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