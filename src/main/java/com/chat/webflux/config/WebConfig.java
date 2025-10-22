package com.chat.webflux.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

@Configuration
public class WebConfig implements WebFluxConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/** URL 요청을 file:///path/to/your/uploads/ 경로의 파일로 매핑합니다.
        // File.separator를 사용하여 OS에 맞는 경로 구분자를 사용하도록 수정
        String resourceLocation = "file:" + uploadDir + (uploadDir.endsWith("/") ? "" : "/");
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
    }
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")      // 모든 경로(/api/**)에 대해
                .allowedOrigins("*")  // 모든 IP 주소에서의 접속을 허용
                .allowedMethods("*")  // 모든 HTTP 메서드(GET, POST 등) 허용
                .allowedHeaders("*")  // 모든 헤더 허용
                .maxAge(3600);
    }
}