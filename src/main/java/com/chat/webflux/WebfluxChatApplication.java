package com.chat.webflux;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;

@EnableReactiveMongoRepositories
@SpringBootApplication

public class WebfluxChatApplication {
    public static void main(String[] args) {
        SpringApplication.run(WebfluxChatApplication.class, args);
    }
}