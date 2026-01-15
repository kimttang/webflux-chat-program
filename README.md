# 🌐 BabelBridge (AI-Enhanced Real-time Chat Platform)

> **Spring WebFlux의 비동기 처리 성능과 Python AI의 정교한 언어 처리를 결합한 하이브리드 채팅 플랫폼** > 실시간 대용량 트래픽 처리가 가능한 Reactive Architecture와 통계 기반/LLM 하이브리드 번역 엔진을 탑재했습니다.

---

## 📅 프로젝트 개요
- **프로젝트명:** BabelBridge (바벨 브릿지)
- **개발 기간:** 2025.9.1 ~ 2025.11.7
- **팀원:** [김태현] (Full Stack & AI Engineering)
- **주요 컨셉:** MSA(Microservices Architecture) 지향의 성장형 AI 채팅 서비스

## 🛠️ Tech Stack (기술 스택)

### Frontend
<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

### Backend (Main Server)
<img src="https://img.shields.io/badge/Spring Boot 3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"> <img src="https://img.shields.io/badge/Spring WebFlux-6DB33F?style=for-the-badge&logo=spring&logoColor=white"> <img src="https://img.shields.io/badge/Java 17-007396?style=for-the-badge&logo=openjdk&logoColor=white"> <img src="https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white">

### Database
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white">

### AI & NLP Service (Sub Server)
<img src="https://img.shields.io/badge/Python 3.10-3776AB?style=for-the-badge&logo=python&logoColor=white"> <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"> <img src="https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white"> <img src="https://img.shields.io/badge/Konlpy-0052CC?style=for-the-badge&logo=ko-fi&logoColor=white"> <img src="https://img.shields.io/badge/Ollama (Gemma)-000000?style=for-the-badge&logo=ollama&logoColor=white">

---

## 🌟 Key Features (핵심 기능)

### 1. ⚡ Reactive Chatting (WebFlux & Netty)
- **기술:** `Spring WebFlux`, `Netty`, `WebSocket`, `Sinks.Many`
- **기능:** 전통적인 Blocking I/O 대신 **Event-Loop 기반의 Non-Blocking I/O**를 적용하여, 적은 리소스로도 대규모 동시 접속 처리가 가능합니다.
- **특징:** MongoDB의 **Reactive Driver**(`ReactiveMongoRepository`)를 사용하여 데이터베이스 입출력까지 완전한 비동기 파이프라인을 구축했습니다.

### 2. 🧠 Hybrid AI 번역 엔진 (Strict Mode)
- **기술:** `KoNLPy (Okt)`, `Dice Score Algorithm`, `Ollama (Gemma 3:4b)`
- **기능:** 단순 번역이 아닌, **학습된 데이터(`sentences.csv`)에 기반한 통계적 검증**을 수행합니다.
- **로직:** 1. 사용자 입력 문장을 형태소 단위로 분해 및 정규화(NFC).
  2. 학습 데이터와의 **Dice Coefficient(유사도 점수)** 계산.
  3. 모르는 단어가 포함된 경우 **번역 거부(Strict Mode)**하여 비즈니스 오역(Hallucination)을 원천 차단.

### 3. 📚 사내 규정 RAG 검색 시스템
- **기술:** `TF-IDF Vectorizer`, `Cosine Similarity`, `Python Flask`
- **기능:** "연차 규정 알려줘"와 같은 자연어 질문 시, 사내 문서 데이터(`company_docs.csv`)에서 가장 유사한 규정을 검색하여 답변합니다.
- **특징:** 키워드 매칭과 벡터 유사도 검색을 결합한 **하이브리드 검색 알고리즘**을 직접 구현했습니다.

### 4. 🔗 Polyglot MSA Architecture
- **기술:** `WebClient`, `REST API`
- **구조:** - **Java Server:** 인증, 채팅 세션 관리, DB 저장 담당.
  - **Python Server:** 고연산이 필요한 NLP 분석 및 AI 추론 담당.
  - 두 서버는 `WebClient`를 통해 **Non-Blocking 방식**으로 통신하여 전체 시스템의 성능 저하를 방지했습니다.

---

## 📐 System Architecture (시스템 구조)

graph LR
    User["User (Browser)"] -- "WebSocket (ws://)" --> Main["Main Server (Spring WebFlux)"]
    
    subgraph "Backend Core (Java)"
    Main -- "Reactive Stream" --> DB[("MongoDB")]
    end
    
    subgraph "AI Engine (Python)"
    Main -- "REST API (Async)" --> Python["AI Server (Flask)"]
    Python -- "NLP Analysis" --> CSV1["Trans Data"]
    Python -- "RAG Search" --> CSV2["Company Docs"]
    Python -- "Inference" --> LLM["Ollama (Gemma)"]
    end
