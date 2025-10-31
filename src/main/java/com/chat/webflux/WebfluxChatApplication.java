package com.chat.webflux;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableReactiveMongoRepositories;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import java.io.IOException;
import java.net.URI;

@EnableReactiveMongoRepositories
@SpringBootApplication
public class WebfluxChatApplication {
    @Value("${server.port:8080}")
    private String serverPort;
    public static void main(String[] args) {
        SpringApplication.run(WebfluxChatApplication.class, args);
    }
    @EventListener(ApplicationReadyEvent.class)
    public void openBrowserAfterStartup() {
        System.out.println(">>> [Babel Bridge] openBrowserAfterStartup() 메소드 실행됨.");

        String url = "http://localhost:" + serverPort;
        String os = System.getProperty("os.name").toLowerCase();
        Runtime rt = Runtime.getRuntime();

        try {
            if (os.contains("win")) {
                // Windows
                System.out.println(">>> [Babel Bridge] Windows OS 감지. 'start' 명령어로 브라우저 실행 시도...");
                rt.exec("cmd /c start " + url);
            } else if (os.contains("mac")) {
                // macOS
                System.out.println(">>> [Babel Bridge] macOS 감지. 'open' 명령어로 브라우저 실행 시도...");
                rt.exec("open " + url);
            } else if (os.contains("nix") || os.contains("nux") || os.contains("aix")) {
                // Linux
                System.out.println(">>> [Babel Bridge] Linux 감지. 'xdg-open' 명령어로 브라우저 실행 시도...");
                rt.exec("xdg-open " + url);
            } else {
                System.out.println(">>> [Babel Bridge] OS를 감지할 수 없어 브라우저를 자동 실행할 수 없습니다.");
                System.out.println(">>> [Babel Bridge] 다음 주소로 직접 접속하세요: " + url);
            }
        } catch (IOException e) {
            System.out.println(">>> [Babel Bridge] OS 네이티브 명령어로 브라우저 열기 실패. " + url + "로 직접 접속하세요.");
            e.printStackTrace();
        }
    }
}