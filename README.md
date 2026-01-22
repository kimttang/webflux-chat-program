# 🌉 BABEL-BRIDGE (Real-time Translation Chat)

> **Spring WebFlux와 WebSocket 기반의 대용량 트래픽 처리를 고려한 실시간 번역 채팅 서비스**

[![Latest Release](https://img.shields.io/github/v/release/kimttang/webflux-chat-program?style=flat-square&color=blue)](https://github.com/kimttang/webflux-chat-program/releases)
![Java](https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![Spring WebFlux](https://img.shields.io/badge/Spring_WebFlux-Reactive-6DB33F?style=flat-square&logo=spring&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-Realtime-000000?style=flat-square&logo=socket.io&logoColor=white)
![Ollama](https://img.shields.io/badge/AI-Ollama-000000?style=flat-square&logo=openai&logoColor=white)

## 📖 Project Overview
BABEL-BRIDGE는 기존의 블로킹 방식(Spring MVC)이 아닌, **Non-Blocking I/O 기반의 Spring WebFlux**를 사용하여 구축한 채팅 어플리케이션입니다. 
단순한 채팅을 넘어, 다국어 사용자를 위한 **실시간 번역**, **AI 요약**, 그리고 **동시성 이슈 해결** 등 백엔드 코어 기술적 챌린지에 집중한 프로젝트입니다.

---

## 🛠 Technical Challenges & Solutions (핵심 문제 해결)
> 이 프로젝트에서 경험한 주요 기술적 이슈와 해결 과정입니다.

### 1. N+1 문제 및 쿼리 최적화
* **문제:** 채팅 목록 조회 시 연관된 유저 정보와 메시지 정보를 가져오는 과정에서 N+1 쿼리가 발생하여 응답 속도 저하.
* **해결:** Reactive Repository의 특성을 살려 **`fetchJoin`** 쿼리를 직접 작성하거나, 연관 데이터를 병렬로 호출한 뒤 **Reactor의 `zip` 연산자**로 결합하여 DB 왕복 횟수를 최소화함.

### 2. 동시성 제어 (Race Condition)
* **문제:** 다수의 유저가 동시에 채팅방을 읽을 때 '안 읽은 사람 수(Read Count)'를 갱신하는 과정에서 데이터 불일치(Lost Update) 발생.
* **해결:** 데이터 무결성을 보장하기 위해 **Atomic Operation(원자적 연산)**을 지원하는 **Redis**를 카운터로 활용하거나, DB 레벨에서 **Optimistic Locking(@Version)**을 적용하여 경쟁 상태를 제어함.

### 3. 실시간 '읽음' 동기화 (SSE & WebSocket)
* **구현:** 채팅방 내부에서는 `WebSocket`을 사용하지만, 채팅방 밖(로비)에 있는 유저에게도 실시간으로 '안 읽음 배지'를 갱신해줘야 함.
* **해결:** 양방향 통신이 필요 없는 로비 화면에는 **`Server-Sent Events(SSE)`**를 도입. 커넥션 리소스를 효율적으로 관리하며 실시간 알림 이벤트를 단방향 스트리밍으로 전송하도록 아키텍처를 분리.

### 4. 글로벌 시간대(Timezone) 처리
* **문제:** 서버 시간과 클라이언트(해외 유저)의 시간 차이로 메시지 타임스탬프 오류 발생.
* **해결:** 모든 데이터는 서버에 **`UTC`** 기준으로 저장하고, 클라이언트 전송 시 브라우저의 로케일 정보를 감지하여 사용자의 **'Local Time'**으로 자동 변환하여 렌더링.

---

## ✨ Key Features

### 💬 Chat System
* **WebSocket 기반 실시간 채팅:** 1:1 DM 및 그룹 채팅 지원
* **메시지 기능:** 답장, 수정, 삭제, **실시간 읽음 확인(안 읽은 사람 수 표시)**
* **스마트 스크롤:** 채팅방 재입장 시 마지막으로 읽은 위치로 자동 스크롤

### 🤖 AI Integration (Ollama)
* **AI 채팅 요약:** 긴 대화 내용을 AI가 자동으로 요약
* **스마트 일정 관리:** 대화 중 `!일정` 명령어 사용 시 내용을 분석하여 캘린더에 자동 등록

### 📂 Utility
* **미디어 전송:** 이미지 및 파일 업로드 지원
* **실시간 알림:** SSE 기반의 로비 내 안 읽음 배지 카운트 실시간 갱신

---

## 📸 Screenshots

<details>
<summary><b>👀 스크린샷 펼쳐보기 (Click)</b></summary>
<br>

![BABEL_BRIDGE](https://github.com/user-attachments/assets/4b54ceb1-4cd6-4f5b-ad6d-5af15b1d2592)

### Main Features
| 채팅 메인 | 기능 예시 | 기능 예시 | 기능 예시 |
|:---:|:---:|:---:|:---:|
| ![1](https://github.com/user-attachments/assets/27660441-5df7-45e0-b51a-08df028a2dc0) | ![2](https://github.com/user-attachments/assets/9cee299d-5f12-4b8c-bc64-f0834c3d1037) | ![3](https://github.com/user-attachments/assets/c8e58810-7893-45e1-85bb-694fc32c3459) | ![4](https://github.com/user-attachments/assets/7c544c2c-32b4-42b5-95e2-7eedf2f8e8a8) |

| 기능 예시 | 기능 예시 | 기능 예시 | 기능 예시 |
|:---:|:---:|:---:|:---:|
| ![5](https://github.com/user-attachments/assets/47716968-3edc-4933-9a16-1d3cf2d9dd72) | ![6](https://github.com/user-attachments/assets/950b6986-76f4-4702-aaef-8aa15c4bfa33) | ![7](https://github.com/user-attachments/assets/c1d255ca-3004-4089-811a-a68c8437e7ad) | ![8](https://github.com/user-attachments/assets/b0b95bb1-73cf-4e5b-a686-4149e81687c9) |

### AI & Others
| AI 기능 | 설정 | 기타 |
|:---:|:---:|:---:|
| ![9](https://github.com/user-attachments/assets/26517b65-e0ae-4668-b76f-bbb5f3c8793d) | ![10](https://github.com/user-attachments/assets/ff7ed12b-d949-4f6e-94bf-265514d42072) | ![13](https://github.com/user-attachments/assets/aec102ad-a6d3-4128-88e0-eee4777b3ad2) |

![11](https://github.com/user-attachments/assets/eff62ee3-0799-4f81-a098-ec20acc32180) 
![12](https://github.com/user-attachments/assets/035b151c-ebe4-4496-9b78-30e33f164dae)
![14](https://github.com/user-attachments/assets/63c872a7-89d0-4396-8c1c-3b7865c960ba)

</details>

---

## 🚀 Getting Started

```bash
git clone [https://github.com/kimttang/webflux-chat-program.git](https://github.com/kimttang/webflux-chat-program.git)
cd webflux-chat-program
./gradlew build
