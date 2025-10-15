package com.chat.webflux.chatroom;

import com.chat.webflux.message.ChatMessageRepository;
import com.chat.webflux.unread.UnreadCountRepository;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UnreadCountRepository unreadCountRepository;
    private final UserRepository userRepository;

    private final Map<String, Sinks.Many<List<ChatRoom>>> userChatRoomSinks = new ConcurrentHashMap<>();

    public Mono<ChatRoom> createChatRoom(String name, String createdBy) {
        ChatRoom chatRoom = new ChatRoom(name, createdBy);
        return chatRoomRepository.save(chatRoom)
                .doOnSuccess(this::broadcastToAllMembers);
    }

    private Sinks.Many<List<ChatRoom>> getOrCreateSink(String username) {
        return userChatRoomSinks.computeIfAbsent(username, u -> Sinks.many().replay().latest());
    }

    public void broadcastRoomListToUser(String username) {
        chatRoomRepository.findByMembersContaining(username)
                .collectList()
                .subscribe(chatRooms -> {
                    Sinks.Many<List<ChatRoom>> sink = getOrCreateSink(username);
                    sink.tryEmitNext(chatRooms);
                });
    }

    public Flux<List<ChatRoom>> getChatRoomUpdates(String username) {
        Mono<List<ChatRoom>> initialList = chatRoomRepository.findByMembersContaining(username).collectList();
        Flux<List<ChatRoom>> updates = getOrCreateSink(username).asFlux();
        return initialList.concatWith(updates);
    }

    public void broadcastToAllMembers(ChatRoom chatRoom) {
        if (chatRoom.getMembers() != null) {
            chatRoom.getMembers().forEach(this::broadcastRoomListToUser);
        }
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
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 채팅방입니다.")))
                .flatMap(chatRoom -> {
                    if (!chatRoom.getMembers().contains(invitedBy)) {
                        return Mono.error(new SecurityException("초대 권한이 없습니다."));
                    }
                    if (chatRoom.getMembers().contains(usernameToInvite)) {
                        return Mono.error(new IllegalArgumentException("이미 채팅방에 참여하고 있는 사용자입니다."));
                    }
                    chatRoom.getMembers().add(usernameToInvite);
                    return chatRoomRepository.save(chatRoom);
                })
                .doOnSuccess(this::broadcastToAllMembers);
    }

    public Mono<Void> leaveChatRoom(String roomId, String username) {
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("존재하지 않는 채팅방입니다.")))
                .flatMap(chatRoom -> {
                    if (!chatRoom.getMembers().contains(username)) {
                        return Mono.error(new SecurityException("당신은 이 채팅방의 멤버가 아닙니다."));
                    }

                    Set<String> remainingMembers = chatRoom.getMembers().stream()
                            .filter(member -> !member.equals(username))
                            .collect(Collectors.toSet());

                    if (remainingMembers.isEmpty()) {
                        return chatMessageRepository.deleteByRoomId(roomId)
                                .then(unreadCountRepository.deleteByRoomId(roomId))
                                .then(chatRoomRepository.delete(chatRoom))
                                .then(Mono.fromRunnable(() -> broadcastRoomListToUser(username)));
                    } else {
                        chatRoom.setMembers(remainingMembers);
                        return chatRoomRepository.save(chatRoom)
                                .doOnSuccess(updatedRoom -> {
                                    broadcastToAllMembers(updatedRoom);
                                    broadcastRoomListToUser(username);
                                }).then();
                    }
                });
    }
}