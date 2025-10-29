package com.chat.webflux.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

//Spring WebFlux의 기본 설정을 커스터마이징하는 클래스
@Configuration
public class WebConfig implements WebFluxConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    //[정적 리소스 핸들러 설정]
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation = "file:" + uploadDir + (uploadDir.endsWith("/") ? "" : "/");
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
    }

    //[CORS (Cross-Origin Resource Sharing) 설정]
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // 모든 경로(/api/**)에 대해 실제 프론트엔드 주소만 허용
                .allowedOrigins("http://localhost:8080", "http://127.0.0.1:8080")
                .allowedMethods("*")  // 모든 HTTP 메서드(GET, POST 등) 허용
                .allowedHeaders("*")  // 모든 헤더 허용
                .allowCredentials(true) //인증 정보(쿠키 등) 허용
                .maxAge(3600);
    }
}