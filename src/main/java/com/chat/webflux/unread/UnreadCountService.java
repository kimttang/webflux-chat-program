package com.chat.webflux.unread;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class UnreadCountService {

    private final UnreadCountRepository unreadCountRepository;

    // [핵심 로직 1] 안 읽은 카운트 1 증가 (중복 데이터 정리 로직 추가)
    public Mono<Void> incrementUnreadCount(String userId, String roomId) {
        // 1. (userId, roomId)에 해당하는 카운트 문서를 "모두" 찾음
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId)
                .collectList() // Flux를 List로 변환
                .flatMap(counts -> {
                    if (counts.isEmpty()) {
                        // 2a. 문서가 없으면: 새로 1개 생성 (카운트 1)
                        UnreadCount newCount = new UnreadCount(userId, roomId);
                        newCount.setCount(1);
                        return unreadCountRepository.save(newCount);
                    } else {
                        // 2b. 문서가 1개 이상 있으면:
                        // 첫 번째 문서(get(0))의 카운트만 +1 하고 저장
                        UnreadCount primaryCount = counts.get(0);
                        primaryCount.setCount(primaryCount.getCount() + 1);

                        // 3. [중복 제거] 만약 2개 이상(중복)이었다면, 두 번째(get(1))부터는 모두 삭제
                        Mono<Void> deleteDuplicates = Flux.fromIterable(counts.subList(1, counts.size()))
                                .flatMap(unreadCountRepository::delete)
                                .then();

                        // 첫 번째 문서 저장(flatMap) + 중복 삭제(then)
                        return unreadCountRepository.save(primaryCount).then(deleteDuplicates);
                    }
                })
                .onErrorResume(DuplicateKeyException.class, e -> {
                    // (혹시 모를 동시 저장 충돌 시, 다시 한번 시도 - 방어 코드)
                    return unreadCountRepository.findByUserIdAndRoomId(userId, roomId).next()
                            .flatMap(unreadCount -> {
                                unreadCount.setCount(unreadCount.getCount() + 1);
                                return unreadCountRepository.save(unreadCount);
                            });
                })
                .then(); // Mono<Void> 반환
    }

    // [핵심 로직 2] 안 읽은 카운트 0으로 리셋 (중복된 문서를 "모두" 리셋하도록 수정)
    public Mono<Void> resetUnreadCount(String userId, String roomId) {
        // 1.  .next()를 제거하고 Flux<UnreadCount>를 직접 처리
        return unreadCountRepository.findByUserIdAndRoomId(userId, roomId)
                .flatMap(unreadCount -> {
                    // 2.  찾은 "모든" 문서의 카운트를 0으로 설정
                    if (unreadCount.getCount() > 0) {
                        unreadCount.setCount(0);
                        return unreadCountRepository.save(unreadCount); // 0으로 리셋된 문서를 저장
                    }
                    return Mono.empty(); // 이미 0이면 아무것도 안 함
                })
                .then(); // 3.  모든 문서의 저장이 끝날 때까지 대기
    }

    // (GET) 특정 사용자의 "모든" 안 읽음 카운트 정보를 조회
    public Flux<UnreadCount> getUnreadCounts(String userId) {
        return unreadCountRepository.findByUserId(userId);
    }
}