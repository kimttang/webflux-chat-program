package com.chat.webflux.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
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
}