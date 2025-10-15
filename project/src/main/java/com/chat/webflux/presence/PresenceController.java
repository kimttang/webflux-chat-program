package com.chat.webflux.presence;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;

@RestController
@RequestMapping("/api/presence")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping(value = "/{username}/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> subscribeToPresenceUpdates(@PathVariable String username) {
        return presenceService.subscribe(username);
    }

    @GetMapping("/{username}/friends/online")
    public Mono<Set<String>> getOnlineFriends(@PathVariable String username) {
        return presenceService.getOnlineFriendUsernames(username);
    }
}