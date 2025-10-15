package com.chat.webflux.handler;

import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.dto.ChatMessageDto;
import com.chat.webflux.dto.IncomingMessage;
import com.chat.webflux.dto.OllamaMessage;
import com.chat.webflux.dto.OllamaRequest;
import com.chat.webflux.dto.OllamaResponse;
import com.chat.webflux.dto.OutgoingMessage;
import com.chat.webflux.message.ChatMessage;
import com.chat.webflux.message.ChatMessageRepository;
import com.chat.webflux.presence.PresenceService;
import com.chat.webflux.unread.UnreadCountService;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class ChatWebSocketHandler implements WebSocketHandler {

    private final Map<String, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final WebClient webClient = WebClient.create();
    private final PresenceService presenceService;
    private final UnreadCountService unreadCountService;


    @Override
    public Mono<Void> handle(WebSocketSession session) {
        String roomId = getRoomId(session);
        String username = getUsernameFromUri(session);

        return chatRoomRepository.findById(roomId)
                .flatMap(chatRoom -> {
                    if (!chatRoom.getMembers().contains(username)) {
                        log.warn("Unauthorized WebSocket connection attempt by user {} to room {}", username, roomId);
                        return Mono.error(new SecurityException("Unauthorized"));
                    }

                    sessions.computeIfAbsent(roomId, key -> ConcurrentHashMap.newKeySet()).add(session);
                    presenceService.userOnline(username);
                    unreadCountService.resetUnreadCount(username, roomId);

                    return session.receive()
                            .flatMap(message -> handleMessage(session, message.getPayloadAsText()))
                            .doOnError(e -> log.error("Error in WebSocket handling for room {}: {}", roomId, e.getMessage()))
                            .doFinally(signalType -> {
                                sessions.get(roomId).remove(session);
                                if (sessions.get(roomId).isEmpty()) {
                                    sessions.remove(roomId);
                                }
                                if (!isUserPresentInAnyRoom(username)) {
                                    presenceService.userOffline(username);
                                }
                                log.info("Session closed for user {} in room {}. Signal: {}", username, roomId, signalType);
                            })
                            .then();
                })
                .doOnError(e -> log.error("Error processing WebSocket connection: {}", e.getMessage()))
                .then();
    }

    private Mono<Void> handleMessage(WebSocketSession session, String payload) {
        String roomId = getRoomId(session);
        String username = getUsernameFromUri(session);
        try {
            IncomingMessage incomingMessage = objectMapper.readValue(payload, IncomingMessage.class);

            switch (incomingMessage.getType()) {
                case "MESSAGE":
                    return handleNewMessage(incomingMessage, username, roomId);
                case "TYPING_START":
                    broadcastMessage(roomId, OutgoingMessage.forEvent("TYPING_START", incomingMessage.getNickname(), null), session);
                    return Mono.empty();
                case "TYPING_STOP":
                    broadcastMessage(roomId, OutgoingMessage.forEvent("TYPING_STOP", incomingMessage.getNickname(), null), session);
                    return Mono.empty();
                case "EDIT_MESSAGE":
                    return handleEditMessage(incomingMessage, username, roomId);
                case "DELETE_MESSAGE":
                    return handleDeleteMessage(incomingMessage, username, roomId);
                case "MESSAGES_READ":
                    return handleMessagesRead(incomingMessage, username, roomId);
                default:
                    return Mono.empty();
            }
        } catch (IOException e) {
            log.error("Error parsing incoming message", e);
            return Mono.error(e);
        }
    }

    //  메시지 읽음 처리 로직
    private Mono<Void> handleMessagesRead(IncomingMessage incomingMessage, String readerUsername, String roomId) {
        List<String> messageIds = incomingMessage.getMessageIds();
        if (messageIds == null || messageIds.isEmpty()) {
            return Mono.empty();
        }

        // 1. 현재 채팅방의 총 멤버 수를 가져옵니다.
        return chatRoomRepository.findById(roomId)
                .flatMap(chatRoom -> {
                    int totalMembers = chatRoom.getMembers().size();

                    // 2. 읽음 처리할 메시지 ID 목록을 순회하며 비동기 처리합니다.
                    return Flux.fromIterable(messageIds)
                            .flatMap(messageId -> chatMessageRepository.findById(messageId)
                                    .flatMap(message -> {
                                        // 3. 메시지를 읽은 사용자 목록에 현재 사용자를 추가합니다.
                                        //    Set.add()는 실제로 값이 추가되었을 때 true를 반환합니다.
                                        boolean changed = message.getReadBy().add(readerUsername);

                                        // 4. 읽음 상태에 변화가 있을 경우에만 DB에 저장하고 모든 클라이언트에게 알립니다.
                                        if (changed) {
                                            return chatMessageRepository.save(message)
                                                    .doOnSuccess(savedMessage -> {
                                                        int unreadCount = totalMembers - savedMessage.getReadBy().size();
                                                        if (unreadCount < 0) unreadCount = 0;

                                                        // 5. '읽음 확인 업데이트' 이벤트를 생성하여 브로드캐스트합니다.
                                                        OutgoingMessage readUpdate = OutgoingMessage.forReadReceiptUpdate(
                                                                savedMessage.getId(),
                                                                savedMessage.getReadBy(),
                                                                unreadCount
                                                        );
                                                        broadcastMessage(roomId, readUpdate); // 모든 클라이언트에게 전송
                                                    });
                                        }
                                        return Mono.empty();
                                    }))
                            .then();
                });
    }


    private Mono<Void> handleNewMessage(IncomingMessage incomingMessage, String username, String roomId) {
        ChatMessage chatMessage = new ChatMessage(roomId, username, incomingMessage.getMessage());
        if (incomingMessage.getReplyToMessageId() != null && !incomingMessage.getReplyToMessageId().isEmpty()) {
            chatMessage.setReplyToMessageId(incomingMessage.getReplyToMessageId());
        }

        return chatMessageRepository.save(chatMessage)
                .flatMap(savedMessage ->
                        userRepository.findByUsername(username)
                                .flatMap(user -> createChatMessageDtoWithReplyInfo(savedMessage, user))
                                .flatMap(chatMessageDto -> {
                                    broadcastMessage(roomId, OutgoingMessage.forChatMessage(chatMessageDto));

                                    chatRoomRepository.findById(roomId).subscribe(chatRoom -> {
                                        chatRoom.getMembers().forEach(member -> {
                                            if (!member.equals(username) && !isUserPresent(roomId, member)) {
                                                unreadCountService.incrementUnreadCount(member, roomId).subscribe();
                                            }
                                        });
                                    });

                                    if (incomingMessage.getTargetLang() != null && !incomingMessage.getTargetLang().isEmpty()) {
                                        translateMessage(savedMessage.getId(), incomingMessage.getMessage(), incomingMessage.getTargetLang(), username)
                                                .subscribe();
                                    }
                                    return Mono.empty();
                                })
                ).then();
    }
    private Mono<ChatMessageDto> createChatMessageDtoWithReplyInfo(ChatMessage message, User sender) {
        ChatMessageDto dto = new ChatMessageDto(message, sender);

        // 이 메시지가 답장이라면 (replyToMessageId가 있다면)
        if (message.getReplyToMessageId() != null && !message.getReplyToMessageId().isEmpty()) {
            // 1. DB에서 원본 메시지를 ID로 찾습니다.
            return chatMessageRepository.findById(message.getReplyToMessageId())
                    // 2. 찾은 원본 메시지의 작성자 정보도 DB에서 찾습니다.
                    .flatMap(parentMessage -> userRepository.findByUsername(parentMessage.getSender())
                            // 3. 원본 메시지와 작성자 정보로 '원본 DTO'를 만듭니다.
                            .map(parentSender -> new ChatMessageDto(parentMessage, parentSender))
                            // 만약 원본 작성자를 못 찾아도, username으로 대체해서 진행합니다.
                            .defaultIfEmpty(new ChatMessageDto(parentMessage, parentMessage.getSender()))
                    )
                    .doOnSuccess(dto::setRepliedMessageInfo) // 4. [핵심] 완성된 '원본 DTO'를 현재 답장 DTO에 설정합니다.
                    .thenReturn(dto) // 5. 모든 작업이 끝나면 최종 답장 DTO를 반환합니다.
                    .defaultIfEmpty(dto); // 원본 메시지를 DB에서 못 찾아도 그냥 진행합니다.
        }
        // 답장이 아니라면 그냥 DTO를 즉시 반환합니다.
        return Mono.just(dto);
    }

    private Mono<Void> handleEditMessage(IncomingMessage incomingMessage, String username, String roomId) {
        return chatMessageRepository.findById(incomingMessage.getMessageId())
                .flatMap(message -> {
                    // 1. 수정 권한을 확인합니다.
                    if (!message.getSender().equals(username)) {
                        return Mono.error(new SecurityException("You are not the sender of this message"));
                    }

                    // 2. [핵심] 재번역이 필요한 언어 목록을 미리 복사해서 확보합니다. (예: ["en", "ja"])
                    //    (clear()를 먼저 하면 어떤 언어로 번역했는지 알 수 없으므로, 반드시 먼저 복사해야 합니다.)
                    Set<String> languagesToTranslate = new java.util.HashSet<>(message.getTranslations().keySet());

                    // 3. 메시지 내용을 수정하고 '수정됨' 상태로 만듭니다.
                    message.setContent(incomingMessage.getMessage());
                    message.setEdited(true);

                    // 4. 기존 번역을 깨끗하게 삭제합니다.
                    message.getTranslations().clear();

                    // 5. 변경된 메시지를 DB에 저장합니다.
                    return chatMessageRepository.save(message)
                            .doOnSuccess(updatedMessage -> {
                                // 6. [핵심] 화면의 원문을 즉시 업데이트하도록 먼저 방송합니다.
                                //    이렇게 하면 사용자는 수정 결과를 바로 볼 수 있습니다.
                                broadcastMessageUpdate(updatedMessage, roomId);

                                // 7. [핵심] 확보해둔 언어 목록으로 '재번역'을 순차적으로 실행합니다.
                                //    번역은 백그라운드에서 조용히 실행되고 그 결과가 DB에 저장됩니다.
                                Flux.fromIterable(languagesToTranslate)
                                        .flatMap(langCode ->
                                                translateMessage(updatedMessage.getId(), updatedMessage.getContent(), langCode, username)
                                        )
                                        .subscribe(); // 백그라운드에서 실행하도록 구독
                            });
                })
                .then();
    }
    private void broadcastMessageUpdate(ChatMessage message, String roomId) {
        userRepository.findByUsername(message.getSender())
                .map(user -> new ChatMessageDto(message, user))
                // 비상시를 대비해 사용자를 못찾아도 username으로 DTO를 만듭니다.
                .defaultIfEmpty(new ChatMessageDto(message, message.getSender()))
                .doOnSuccess(dto -> {
                    OutgoingMessage outgoingMessage = OutgoingMessage.forMessageUpdate(dto);
                    broadcastMessage(roomId, outgoingMessage);
                })
                .subscribe();
    }
    private Mono<Void> handleDeleteMessage(IncomingMessage incomingMessage, String username, String roomId) {
        return chatMessageRepository.findById(incomingMessage.getMessageId())
                .flatMap(message -> {
                    if (!message.getSender().equals(username)) {
                        return Mono.error(new SecurityException("You can only delete your own messages."));
                    }
                    message.setDeleted(true);
                    message.setContent("삭제된 메시지입니다.");
                    return chatMessageRepository.save(message);
                })
                .flatMap(deletedMessage ->
                        userRepository.findByUsername(deletedMessage.getSender())
                                .map(user -> new ChatMessageDto(deletedMessage, user))
                )
                .doOnSuccess(deletedDto -> {
                    OutgoingMessage outgoingMessage = OutgoingMessage.forMessageUpdate(deletedDto);
                    broadcastMessage(roomId, outgoingMessage);
                })
                .then();
    }


    private Mono<Void> translateMessage(String messageId, String text, String targetLang, String username) {
        String url = "http://localhost:11434/api/chat";
        String prompt = "You are an expert translator. Your sole purpose is to translate text. " +
                "Provide only the translated text, without any explanations, original text, or any other words. " +
                "Translate the following text to " + targetLang + ":\n\n" + text;

        OllamaRequest request = new OllamaRequest("gemma3:4b", Collections.singletonList(new OllamaMessage("user", prompt)), false);
        return webClient.post()
                .uri(url)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OllamaResponse.class)
                .flatMap(response -> {
                    String translatedText = extractTranslatedText(response.getMessage().getContent());
                    return chatMessageRepository.findById(messageId)
                            .flatMap(message -> {
                                message.getTranslations().put(targetLang, translatedText);
                                return chatMessageRepository.save(message);
                            })
                            .doOnSuccess(savedMessage -> {
                                OutgoingMessage outgoingMessage = OutgoingMessage.forTranslateResult(username, translatedText, messageId);
                                broadcastMessage(savedMessage.getRoomId(), outgoingMessage);
                            });
                })
                .doOnError(error -> log.error("Error translating message: {}", error.getMessage()))
                .then();
    }

    private Mono<String> getRoomIdFromMessageId(String messageId) {
        return chatMessageRepository.findById(messageId)
                .map(ChatMessage::getRoomId);
    }
    public void broadcastMessage(String roomId, OutgoingMessage outgoingMessage, WebSocketSession exclude) {
        Set<WebSocketSession> roomSessions = sessions.get(roomId);
        if (roomSessions != null) {
            try {
                String messageStr = objectMapper.writeValueAsString(outgoingMessage);
                roomSessions.stream()
                        .filter(s -> s.isOpen() && (exclude == null || !s.getId().equals(exclude.getId())))
                        .forEach(s -> s.send(Mono.just(s.textMessage(messageStr))).subscribe());
            } catch (IOException e) {
                log.error("Error serializing outgoing message", e);
            }
        }
    }
    public void broadcastMessage(String roomId, OutgoingMessage outgoingMessage) {
        broadcastMessage(roomId, outgoingMessage, null);
    }
    private String extractTranslatedText(String rawContent) {
        if (rawContent == null) return "";
        String cleanedContent = rawContent.replace("\"", "").replace("*", "").trim();
        String[] lines = cleanedContent.split("\\n");
        return lines.length > 0 ? lines[0].trim() : cleanedContent;
    }
    private boolean isUserPresent(String roomId, String username) {
        Set<WebSocketSession> roomSessions = sessions.get(roomId);
        if (roomSessions == null) return false;
        return roomSessions.stream().anyMatch(s -> username.equals(getUsernameFromUri(s)));
    }
    private boolean isUserPresentInAnyRoom(String username) {
        return sessions.values().stream().flatMap(Set::stream).anyMatch(s -> username.equals(getUsernameFromUri(s)));
    }
    private String getRoomId(WebSocketSession session) {
        String path = session.getHandshakeInfo().getUri().getPath();
        return path.substring(path.lastIndexOf('/') + 1);
    }
    private String getUsernameFromUri(WebSocketSession session) {
        try {
            String username = UriComponentsBuilder.fromUri(session.getHandshakeInfo().getUri()).build().getQueryParams().getFirst("username");
            return (username != null) ? URLDecoder.decode(username, StandardCharsets.UTF_8) : null;
        } catch (Exception e) {
            log.error("Error decoding username from URI", e);
            return null;
        }
    }

}