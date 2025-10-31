//이 서비스는 안 읽은 메시지 수를 관리하는 핵심 비즈니스 로직을 담당.
package com.chat.webflux.unread;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service //서비스 레이어 컴포넌트
@RequiredArgsConstructor// final 필드(unreadCountRepository)용 생성자를 자동 생성
public class UnreadCountService {
    // "안 읽음" 카운트 DB에 접근하기 위한 리포지토리
    private final UnreadCountRepository unreadCountRepository;

//[핵심 로직 1] 특정 유저의 특정 방 안 읽은 카운트를 1 증가시킵니다.
    public Mono<Void> incrementUnreadCount(String userId, String roomId) {
        // 1. DB에서 (userId, roomId)에 해당하는 카운트 문서를 찾음 (.next()로 Mono<UnreadCount> 변환)
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next()
                .switchIfEmpty(Mono.defer(() -> unreadCountRepository.save(new UnreadCount(userId, roomId)))
                        .onErrorResume(DuplicateKeyException.class,
                                e -> unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next())
                )
                .flatMap(unreadCount -> {
                    unreadCount.setCount(unreadCount.getCount() + 1);
                    return unreadCountRepository.save(unreadCount);
                }).then();
    }

// [핵심 로직 2] 특정 유저의 특정 방 안 읽은 카운트를 0으로 리셋합니다.
    public Mono<Void> resetUnreadCount(String userId, String roomId) {
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next()
                .switchIfEmpty(Mono.defer(() -> unreadCountRepository.save(new UnreadCount(userId, roomId)))

                        .onErrorResume(DuplicateKeyException.class,
                                e -> unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next())
                )
                .flatMap(unreadCount -> {
                    if (unreadCount.getCount() > 0) {
                        unreadCount.setCount(0);
                        return unreadCountRepository.save(unreadCount);
                    }
                    return Mono.empty();
                }).then();
    }

    // (GET) 특정 사용자의 "모든" 안 읽음 카운트 정보를 조회
    public Flux<UnreadCount> getUnreadCounts(String userId) {
        return unreadCountRepository.findByUserId(userId);
    }
}