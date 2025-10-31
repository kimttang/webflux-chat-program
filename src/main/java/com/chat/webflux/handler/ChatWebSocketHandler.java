package com.chat.webflux.handler;

import com.chat.webflux.calendar.CalendarEvent;
import com.chat.webflux.calendar.CalendarEventRepository;
import com.chat.webflux.chatroom.ChatRoom;
import com.chat.webflux.chatroom.ChatRoomRepository;
import com.chat.webflux.chatroom.ChatRoomService;
import com.chat.webflux.dto.*;
import com.chat.webflux.message.ChatMessage;
import com.chat.webflux.message.ChatMessageRepository;
import com.chat.webflux.presence.PresenceService;
import com.chat.webflux.unread.UnreadCountService;
import com.chat.webflux.user.User;
import com.chat.webflux.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

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
    private final ChatRoomService chatRoomService;
    private final CalendarEventRepository calendarEventRepository;
    private final WebClient.Builder webClientBuilder;
    private final Map<String, Map<String, WebSocketSession>> roomSessions = new ConcurrentHashMap<>();

    @Value("${ollama.base-url}")
    private String ollamaBaseUrl;
    @Value("${ollama.model}")
    private String ollamaModel;

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        // 1. (유저 코드) roomId, username 추출
        String roomId = getRoomId(session);
        String username = getUsernameFromUri(session);
        String sessionId = session.getId();

        // 2. [수정] findById를 시도하고, .switchIfEmpty()로 "없을 경우"의 로직을 추가
        return chatRoomRepository.findById(roomId)
                .switchIfEmpty(Mono.defer(() -> {
                    // 3. [신규] 방이 없을 때, ID에 '-'가 포함되어 있으면 "새 DM방"으로 간주
                    if (roomId.contains("-") && !username.isBlank()) {
                        log.info("새 1:1 DM방을 생성합니다: {}", roomId);

                        // 4. [신규] ID에서 두 유저의 이름을 파싱 (예: "userA-userB")
                        String[] users = roomId.split("-");
                        if (users.length != 2) {
                            return Mono.error(new IllegalArgumentException("잘못된 DM방 ID 형식입니다."));
                        }
                        String user1 = users[0];
                        String user2 = users[1];

                        // 5. [신규] 두 유저의 닉네임을 DB에서 찾아 "닉네임A & 닉네임B" 형식으로 조합
                        // (UserRepository가 이 클래스에 주입되어 있습니다)
                        Mono<User> userMono1 = userRepository.findByUsername(user1);
                        Mono<User> userMono2 = userRepository.findByUsername(user2);

                        return Mono.zip(userMono1, userMono2)
                                .flatMap(tuple -> {
                                    String name = tuple.getT1().getNickname() + " & " + tuple.getT2().getNickname();
                                    String fromUser = username; // 현재 접속 시도 중인 유저
                                    String toUser = username.equals(user1) ? user2 : user1; // 상대방 유저

                                    // 6. [신규] 'isDm = true'로 설정하는 DM 생성자 호출!
                                    ChatRoom newDmRoom = new ChatRoom(roomId, name, fromUser, toUser);

                                    // 7. [신규] DB에 저장
                                    return chatRoomRepository.save(newDmRoom);
                                });
                    } else {
                        // 그룹방이거나 username이 없으면 에러
                        return Mono.error(new SecurityException("존재하지 않는 채팅방입니다."));
                    }
                }))
                .flatMap(chatRoom -> { // <--- .flatMap(chatRoom -> ...)은 여기서부터 시작
                    // 8. (기존 로직) 보안 검사
                    if (!chatRoom.getMembers().contains(username)) {
                        log.warn("Unauthorized WebSocket connection attempt by user {} to room {}", username, roomId);
                        return Mono.error(new SecurityException("Unauthorized"));
                    }

                    // 9. (기존 로직) 세션 추가, 접속 알림 등...
                    roomSessions.computeIfAbsent(roomId, k -> new ConcurrentHashMap<>()).put(sessionId, session);
                    presenceService.userOnline(username);
                    Mono<Void> resetDbMono = unreadCountService.resetUnreadCount(username, roomId);
                    Mono<Void> broadcastSseMono = Mono.fromRunnable(() -> {
                                try {
                                    chatRoomService.broadcastRoomListToUser(username);
                                } catch (Exception e) {
                                    log.error("SSE 브로드캐스트 실패 (handle). userId: {}. Error: {}", username, e.getMessage(), e);
                                }
                            })
                            .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
                            .then();

                    // 10. (기존 로직) 메시지 수신 시작
                    return resetDbMono
                            .then(broadcastSseMono)
                            .then(
                                    session.receive()
                                            .flatMap(message -> handleMessage(session, message.getPayloadAsText()))
                                            .doOnError(e -> log.error("Error in WebSocket handling for room {}: {}", roomId, e.getMessage()))
                                            .doFinally(signalType -> {
                                                // 11. (기존 로직) 세션 제거
                                                Map<String, WebSocketSession> sessionsInRoom = roomSessions.get(roomId);
                                                if (sessionsInRoom != null) {
                                                    sessionsInRoom.remove(sessionId);
                                                    if (sessionsInRoom.isEmpty()) {
                                                        roomSessions.remove(roomId);
                                                        log.info("[WS Room Empty] Room {} is now empty.", roomId);
                                                    }
                                                }
                                                if (!isUserPresentInAnyRoom(username)) {
                                                    presenceService.userOffline(username);
                                                }
                                                log.info("Session closed for user {} in room {}. Signal: {}", username, roomId, signalType);
                                            })
                                            .then()
                            );
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
                    return handleNewMessage(session, incomingMessage, username, roomId);
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
                case "UPDATE_ANNOUNCEMENT":
                    return handleUpdateAnnouncement(session, incomingMessage.getMessage());
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
            return Mono.empty(); // [수정] 아무것도 안 함 -> DB 리셋 및 SSE 방송 로직 추가
        }

        // [기존 로직] 개별 메시지 '읽음'(readBy) 처리
        Mono<Void> updateReadByMono = chatRoomRepository.findById(roomId)
                .flatMap(chatRoom -> {
                    int totalMembers = chatRoom.getMembers().size();

                    return Flux.fromIterable(messageIds)
                            .flatMap(messageId -> chatMessageRepository.findById(messageId)
                                    .flatMap(message -> {
                                        boolean changed = message.getReadBy().add(readerUsername);

                                        if (changed) {
                                            return chatMessageRepository.save(message)
                                                    .doOnSuccess(savedMessage -> {
                                                        int unreadCount = totalMembers - savedMessage.getReadBy().size();
                                                        if (unreadCount < 0) unreadCount = 0;

                                                        OutgoingMessage readUpdate = OutgoingMessage.forReadReceiptUpdate(
                                                                savedMessage.getId(),
                                                                savedMessage.getReadBy(),
                                                                unreadCount
                                                        );
                                                        broadcastMessage(roomId, readUpdate);
                                                    });
                                        }
                                        return Mono.empty();
                                    }))
                            .then();
                });

        // [수정] 1. (handle 메서드와 동일) DB 리셋 Mono를 정의
        Mono<Void> resetDbMono = unreadCountService.resetUnreadCount(readerUsername, roomId);

        // [수정] 2. (handle 메서드와 동일) SSE 방송 Mono를 별도로 정의
        Mono<Void> broadcastSseMono = Mono.fromRunnable(() -> {
                    try {
                        chatRoomService.broadcastRoomListToUser(readerUsername);
                    } catch (Exception e) {
                        log.error("SSE 브로드캐스트 실패 (handleMessagesRead). userId: {}. Error: {}", readerUsername, e.getMessage(), e);
                    }
                })
                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic()) // 별도 스레드
                .then();


        // [수정] 3. 모든 Mono를 순서대로 연결
        return updateReadByMono
                .then(resetDbMono)
                .then(broadcastSseMono);
    }

    private Mono<Void> handleNewMessage(WebSocketSession session, IncomingMessage incomingMessage, String username, String roomId) {
        String content = incomingMessage.getMessage();
        // [신규 로직] @바브봇 명령어 감지

        if (content != null && content.startsWith("@바브봇")) {
            if (content.contains("요약") || content.contains("summarize")) {
                // "요약" 명령어가 포함된 경우, 요약 핸들러로 처리를 넘깁니다.
                return handleSummaryCommand(session, roomId, username); // [수정] session을 사용합니다.
            } else {
                log.warn("Unknown AI Bot command received: {}", content);
                return Mono.empty(); // 메시지 저장/전송 안 함
            }
        }

        // !일정 감지 시, "roomId"를 인자로 넘겨줌
        if (content != null && content.startsWith("!일정 ")) {
            String commandText = content.substring(4).trim();

            //roomId를 함께 전달하도록 수정
            return processScheduleCommand(commandText, roomId);
        }

        ChatMessage chatMessage = new ChatMessage(roomId, username, content);
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
                                        chatRoomService.broadcastToAllMembers(chatRoom);
                                    });

                                    if (incomingMessage.getTargetLang() != null && !incomingMessage.getTargetLang().isEmpty()) {
                                        translateMessage(savedMessage.getId(), incomingMessage.getMessage(), incomingMessage.getTargetLang(), username)
                                                .subscribe();
                                    }
                                    return chatRoomRepository.findById(roomId)
                                            .flatMap(chatRoom -> {

                                                // "안 읽음 숫자 1 증가" 작업을 Mono<Void>로 정의
                                                Mono<Void> incrementMono = Flux.fromIterable(chatRoom.getMembers())
                                                        .filter(member -> !member.equals(username)) // 보낸 사람 제외
                                                        .filter(member -> !isUserPresent(roomId, member))  // 채팅방에 없는 사람만
                                                        .flatMap(member -> unreadCountService.incrementUnreadCount(member, roomId)) // (A) DB Write
                                                        .then(); // <-- 모든 DB 저장이 끝날 때까지 기다림

                                                //  "안 읽음" 저장이 "모두" 완료된 "후에"(.then) SSE 갱신 실행
                                                return incrementMono
                                                        .then(Mono.fromRunnable(() -> {
                                                            log.info("[SSE Broadcast] 텍스트 메시지로 인한 목록 갱신 (Room: {})", chatRoom.getId());
                                                            // 이 시점엔 DB Write가 완료되었으므로, broadcast가 정확한 숫자를 읽음
                                                            chatRoom.getMembers().forEach(chatRoomService::broadcastRoomListToUser);
                                                        }));
                                            });
                                })
                )
                .then(); // Mono<Void> 반환


    }

    /**
     * [신규 추가 - ★수정 버전★] AI 봇 - 대화 요약 커맨드 처리
     */
    private Mono<Void> handleSummaryCommand(WebSocketSession session, String roomId, String requesterUsername) {
        log.info("AI Bot command 'summarize' received for room: {} from user: {}", roomId, requesterUsername);

        // 1. 봇 이름, API URL, 모델 설정
        final String BOT_USERNAME = "바브봇";
        final int MESSAGE_LIMIT = 50;

        // 2. 채팅방 정보 및 최근 메시지를 가져옵니다.
        Mono<ChatRoom> roomMono = chatRoomRepository.findById(roomId);
        Mono<List<ChatMessage>> messagesMono = chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId)
                .collectList()
                .map(messages -> messages.subList(Math.max(0, messages.size() - MESSAGE_LIMIT), messages.size()));

        // [수정] Error 3: 'findAllByUsernameIn' 대신 'findByUsername'을 반복 호출하는 안전한 방식으로 변경
        Mono<Map<String, String>> userNicknameMapMono = messagesMono.flatMap(messages ->
                Flux.fromIterable(messages)
                        .map(ChatMessage::getSender) // 메시지 작성자 목록 추출
                        .distinct() // 중복 제거
                        .flatMap(username -> userRepository.findByUsername(username) // 각 username으로 User 정보 조회
                                // 혹시 User를 못찾아도, 닉네임을 username으로 대체하여 진행
                                .map(User::getNickname)
                                .defaultIfEmpty(username)
                                .map(nickname -> Map.entry(username, nickname)) // (username, nickname) 맵 엔트리 생성
                        )
                        .collectMap(Map.Entry::getKey, Map.Entry::getValue) // (username, nickname) 맵으로 변환
        );

        // 3. 모든 정보(채팅방, 메시지, 닉네임)가 준비되면 Ollama 호출
        return Mono.zip(roomMono, messagesMono, userNicknameMapMono)
                .flatMap(tuple -> {
                    ChatRoom room = tuple.getT1(); // [수정] Error 4: 변수명은 'room'입니다.
                    List<ChatMessage> messages = tuple.getT2();
                    Map<String, String> userNicknameMap = tuple.getT3();

                    // 4. Ollama에 보낼 '대화 컨텍스트' 문자열 생성
                    String conversationContext = messages.stream()
                            .filter(msg -> msg.getMessageType() == ChatMessage.MessageType.TEXT && !msg.getContent().startsWith("@바브봇")) // 봇 호출 메시지 제외
                            .map(msg -> {
                                String nickname = userNicknameMap.getOrDefault(msg.getSender(), msg.getSender()); // 닉네임 찾기
                                return String.format("%s: %s", nickname, msg.getContent());
                            })
                            .collect(Collectors.joining("\n"));

                    if (conversationContext.isEmpty()) {
                        conversationContext = "요약할 대화 내용이 없습니다.";
                    }

                    // 5. Ollama 프롬프트 구성
                    String prompt = "다음은 채팅 대화 내용입니다. 이 대화의 핵심 내용을 3줄 이내로 간결하게 요약해주세요.\n\n[대화 내용]\n" + conversationContext;

                    // 6. Ollama API 호출
                    OllamaRequest ollamaRequest = new OllamaRequest(ollamaModel, List.of(new OllamaMessage("user", prompt)), false);
                    String finalApiUrl = ollamaBaseUrl.endsWith("/api/chat") ? ollamaBaseUrl : ollamaBaseUrl + "/api/chat";

                    return webClient.post().uri(finalApiUrl).bodyValue(ollamaRequest)
                            .retrieve()
                            .bodyToMono(OllamaResponse.class)
                            .flatMap(ollamaResponse -> {
                                // 7. Ollama의 응답(요약)을 '바브봇'이 보낸 새 메시지로 생성
                                String summaryContent = extractTranslatedText(ollamaResponse.getMessage().getContent());
                                ChatMessage botMessage = new ChatMessage(roomId, BOT_USERNAME, summaryContent);
                                botMessage.getReadBy().add(BOT_USERNAME); // 봇은 스스로 읽음 처리

                                // 8. 봇 메시지를 DB에 저장
                                return chatMessageRepository.save(botMessage)
                                        .flatMap(savedMessage ->
                                                // 9. 봇 유저 정보를 찾아서 DTO 생성 (DB에 봇 유저가 없을 것을 대비)
                                                userRepository.findByUsername(BOT_USERNAME)
                                                        .map(user -> new ChatMessageDto(savedMessage, user))
                                                        .defaultIfEmpty(new ChatMessageDto(savedMessage, BOT_USERNAME)) // 비상용 DTO 생성
                                                        .flatMap(chatMessageDto -> {
                                                            // 10. 봇 메시지를 브로드캐스트
                                                            broadcastMessage(roomId, OutgoingMessage.forChatMessage(chatMessageDto));

                                                            // [수정] Error 4, 5: 'chatRoom' 대신 'room' 변수 사용
                                                            room.getMembers().forEach(member -> {
                                                                if (!member.equals(BOT_USERNAME) && !isUserPresent(roomId, member)) {
                                                                    unreadCountService.incrementUnreadCount(member, roomId).subscribe();
                                                                }
                                                            });
                                                            chatRoomService.broadcastToAllMembers(room);

                                                            return Mono.empty();
                                                        })
                                        ).then();
                            });
                })
                .doOnError(e -> log.error("Error processing summary command: {}", e.getMessage(), e))
                .then(); // Mono<Void> 반환
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
        final String OLLAMA_API_URL = this.ollamaBaseUrl + "/api/chat";
        String prompt = "You are an expert translator. Your sole purpose is to translate text. " +
                "Provide only the translated text, without any explanations, original text, or any other words. " +
                "Translate the following text to " + targetLang + ":\n\n" + text;

        OllamaRequest request = new OllamaRequest(this.ollamaModel, Collections.singletonList(new OllamaMessage("user", prompt)), false);

        // --- [수정 4] webClient가 수정된 OLLAMA_API_URL을 사용하도록 변경 ---
        return webClient.post()
                .uri(OLLAMA_API_URL) // 수정된 변수 사용
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OllamaResponse.class)
                .flatMap(response -> {
                    String translatedText = extractTranslatedText(response.getMessage().getContent());

                    // (이하 로직은 모두 동일)
                    return chatMessageRepository.findById(messageId) // [ChatMessageRepository.java]
                            .flatMap(message -> {
                                message.getTranslations().put(targetLang, translatedText);
                                return chatMessageRepository.save(message);
                            })
                            .doOnSuccess(savedMessage -> {
                                OutgoingMessage outgoingMessage = OutgoingMessage.forTranslateResult(username, translatedText, messageId); // [OutgoingMessage.java]
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
        Map<String, WebSocketSession> sessionsInRoom = roomSessions.get(roomId); // ⬅️ [수정]
        if (sessionsInRoom != null) {
            try {
                String messageStr = objectMapper.writeValueAsString(outgoingMessage);
                sessionsInRoom.values().stream()
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

    public boolean isUserPresent(String roomId, String username) {
        Map<String, WebSocketSession> sessionsInRoom = roomSessions.get(roomId);
        if (roomSessions == null) return false;
        return sessionsInRoom.values().stream().anyMatch(s -> username.equals(getUsernameFromUri(s)));
    }

    private boolean isUserPresentInAnyRoom(String username) {
        return roomSessions.values().stream() // Map<String, WebSocketSession>
                .flatMap(sessionsInRoom -> sessionsInRoom.values().stream()) // WebSocketSession
                .anyMatch(s -> username.equals(getUsernameFromUri(s)));
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

    private Mono<Void> handleUpdateAnnouncement(WebSocketSession session, String content) {
        String roomId = getRoomId(session);
        // 1. DB에서 채팅방을 찾습니다.
        return chatRoomRepository.findById(roomId)
                .flatMap(room -> {
                    // 2. 채팅방의 공지 내용을 업데이트합니다. (내용이 비어있으면 null로 저장 = 공지 삭제)
                    room.setAnnouncement(content != null && !content.isEmpty() ? content : null);
                    // 3. DB에 저장합니다.
                    return chatRoomRepository.save(room);
                })
                .doOnSuccess(savedRoom -> {
                    chatRoomService.broadcastToAllMembers(savedRoom);
                })
                .then(); // Mono<Void> 반환
    }

    // !일정 명령어를 처리하는 함수 (AI 연동)
    private Mono<Void> processScheduleCommand(String commandText, String roomId) {

        // ollama가 제목에 날짜를 빼도록 프롬프트 수정
        String prompt = String.format(
                "Today's date is %s. The user's timezone is KST (UTC+9). " +
                        "Parse the following request and extract 'title' and 'start' datetime. " +
                        "The 'title' should be the event's *description only*, EXCLUDING any dates or times. " +
                        "The 'start' datetime MUST be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ), " +
                        "meaning you MUST convert the user's KST time to UTC (Z). " +
                        "EXAMPLE REQUEST: '10월 22일 오후 3시 팀 회의' -> " +
                        "EXAMPLE JSON: {\"title\": \"팀 회의\", \"start\": \"2025-10-22T06:00:00Z\"}. " +
                        "Respond ONLY with the JSON object. Request: \"%s\"",
                LocalDate.now(ZoneId.of("Asia/Seoul")).toString(),
                commandText
        );

        OllamaRequest ollamaRequest = new OllamaRequest(ollamaModel, List.of(new OllamaMessage("user", prompt)), false);
        String finalApiUrl = ollamaBaseUrl.endsWith("/api/chat") ? ollamaBaseUrl : ollamaBaseUrl + "/api/chat";

        return webClient.post().uri(finalApiUrl)
                .bodyValue(ollamaRequest)
                .retrieve()
                .bodyToMono(OllamaResponse.class)
                .flatMap(ollamaResponse -> {
                    try {
                        String rawResponse = ollamaResponse.getMessage().getContent();

                        int jsonStart = rawResponse.indexOf('{');
                        int jsonEnd = rawResponse.lastIndexOf('}');

                        if (jsonStart != -1 && jsonEnd != -1 && jsonEnd > jsonStart) {
                            String cleanJson = rawResponse.substring(jsonStart, jsonEnd + 1);
                            OllamaScheduleDto dto = objectMapper.readValue(cleanJson, OllamaScheduleDto.class);

                            // 7. DB에 저장할 객체 생성
                            CalendarEvent newEvent = new CalendarEvent();
                            newEvent.setTitle(dto.getTitle());
                            newEvent.setStart(Instant.parse(dto.getStart()));

                            //  "채팅방 공용 캘린더"로 저장
                            newEvent.setScope("ROOM"); // 범위 = 채팅방
                            newEvent.setOwnerId(roomId);   // 주인 = 현재 채팅방 ID

                            // 8. DB에 새 일정 저장
                            return calendarEventRepository.save(newEvent)
                                    .flatMap(savedEvent -> {
                                        // 9. 봇 메시지 엔티티 생성
                                        ChatMessage botMessage = new ChatMessage(
                                                roomId,
                                                "바브봇", // 봇의 고유 ID (system, bot 등)
                                                "'" + savedEvent.getTitle() + "' 일정을 추가했습니다." // 예: '팀 회의' 일정을 추가했습니다.
                                        );

                                        // 10. 봇 메시지를 DB에 저장
                                        return chatMessageRepository.save(botMessage);
                                    })
                                    .flatMap(savedBotMessage -> {
                                        // 11. 봇 유저 정보 생성 (DTO 변환용)
                                        User botUser = new User();
                                        botUser.setUsername("바브봇"); // (중요: 이 ID는 실제 유저와 겹치지 않아야 함)
                                        botUser.setNickname("바브봇");
                                        // (선택적) 봇 프로필 아이콘이 있다면 지정합니다. (예: /resource/icon/bot_profile.png)
                                        botUser.setProfilePictureUrl(null);

                                        // 12. 봇 메시지를 DTO로 변환
                                        ChatMessageDto botMessageDto = new ChatMessageDto(savedBotMessage, botUser);

                                        // 13. DTO를 OutgoingMessage로 래핑
                                        OutgoingMessage outgoingMessage = OutgoingMessage.forChatMessage(botMessageDto);

                                        // 14. DTO를 채팅방 모든 세션에 브로드캐스트
                                        // (FileController에서 사용하는 public 메서드를 호출합니다)
                                        // [!] broadcastMessageToRoom 메서드가 public이어야 합니다.
                                        return this.broadcastMessageToRoom(roomId, outgoingMessage);
                                    });

                        } else {
                            log.error("Ollama가 JSON을 반환하지 않았습니다: {}", rawResponse);
                            return Mono.error(new RuntimeException("Ollama가 JSON을 반환하지 않음"));
                        }

                    } catch (Exception e) {
                        log.error("Ollama 일정 파싱 최종 실패: {}", e.getMessage());
                        return Mono.error(new RuntimeException("Ollama 응답 파싱 실패", e));
                    }
                })
                .doOnError(e -> log.error("!일정 처리 중 Ollama 호출 오류: {}", e.getMessage(), e))
                .then();
    }

    public Mono<Void> broadcastMessageToRoom(String roomId, OutgoingMessage message) {
        // 1. 이 방에 연결된 모든 세션을 가져옵니다.
        // (roomSessions 필드는 클래스 상단에 Map<String, Map<String, WebSocketSession>>으로 선언되어 있어야 합니다)
        Map<String, WebSocketSession> sessions = roomSessions.get(roomId);

        // 2. 세션이 없으면 아무 작업도 하지 않고 종료
        if (sessions == null || sessions.isEmpty()) {
            log.warn("[Broadcast] 방 ID {}에 활성 세션이 없습니다.", roomId);
            return Mono.empty();
        }

        try {
            // 3. OutgoingMessage를 JSON 문자열로 직렬화 (objectMapper는 주입된 필드)
            String messageJson = objectMapper.writeValueAsString(message);

            // 4. 이 방의 모든 세션에 메시지 전송
            return Flux.fromIterable(sessions.values())
                    .flatMap(session -> {
                        // 5. 세션이 열려있는지 확인
                        if (session.isOpen()) {
                            return session.send(Mono.just(session.textMessage(messageJson)))
                                    // 개별 전송 실패 시 로그만 남기고 계속 진행
                                    .doOnError(e -> log.error("[Broadcast] 세션 {}에 메시지 전송 실패: {}", session.getId(), e.getMessage()))
                                    .onErrorResume(e -> Mono.empty()); // 실패한 세션은 무시
                        } else {
                            log.warn("[Broadcast] 세션 {}가 닫혀있어 메시지를 전송하지 않습니다.", session.getId());
                            return Mono.empty(); // 닫힌 세션은 무시
                        }
                    })
                    .then();
        } catch (JsonProcessingException e) {
            log.error("[Broadcast] OutgoingMessage 직렬화 실패", e);
            return Mono.error(e); // 직렬화 자체에 실패하면 에러 반환
        }
    }

    @lombok.Data
    private static class OllamaScheduleDto {
        private String title;
        private String start;
    }
}