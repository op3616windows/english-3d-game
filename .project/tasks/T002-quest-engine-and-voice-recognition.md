---
id: T002
title: Xây dựng Quest Engine, nhận diện giọng nói qua microphone và hoàn thành trả thưởng
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - index.html
  - src/style.css
  - src/quest.js
  - src/voice.js
  - src/dialogue.js
  - src/main.js
---

# T002 — Xây dựng Quest Engine, nhận diện giọng nói qua microphone và hoàn thành trả thưởng

## Context

Sau khi đã có nhân vật NPC và hộp thoại tương tác ở T001, task này hiện thực hóa cơ chế học tập theo cốt truyện: Quest Engine quản lý vòng đời nhiệm vụ, hệ thống nhận diện giọng nói qua microphone (Web Speech API SpeechRecognition) với cơ chế tự động chuyển đổi Fallback khi không có micro, và màn hình chúc mừng hoàn tất nhiệm vụ.

## Approach

- Tạo file `src/quest.js` chứa class `QuestEngine`:
  - Quản lý danh sách nhiệm vụ tiếng Anh (ví dụ: Quest 1: "Find and pronounce the Book", Quest 2: "Explore the classroom and pronounce the Apple").
  - Trạng thái quest: `available`, `active`, `completed`, `rewarded`.
  - Phương thức `getAvailableQuest()`, `acceptQuest(id)`, `checkObjective(targetWord, spokenWord)`, `turnInQuest(id)`, `getCurrentQuest()`.
  - Lưu trạng thái quest an toàn (chống nhận trùng và chống spam nhận thưởng lặp lại - đáp ứng E2, E4, N2, N4).
- Tạo file `src/voice.js` chứa class `VoiceService`:
  - Khởi tạo `SpeechRecognition` hoặc `webkitSpeechRecognition`.
  - Phương thức `isSupported()`: kiểm tra tính sẵn sàng của API trong trình duyệt hiện tại.
  - Phương thức `startListening(targetWord, onResult, onError)`:
    - Lắng nghe sự kiện `result` để lấy chuỗi âm thanh chuyển thành văn bản.
    - Chuẩn hóa chuỗi (chuyển chữ thường, loại bỏ dấu chấm/phẩy) và so sánh với `targetWord`.
    - Thiết lập timeout an toàn (ví dụ 8 giây) để tránh tình trạng im lặng/treo vô hạn khi chờ microphone (đáp ứng N3).
  - Cung cấp chế độ `FallbackMode` (nhập text từ bàn phím hoặc trắc nghiệm 3 đáp án) khi micro bị từ chối quyền hoặc trình duyệt không hỗ trợ (đáp ứng E3).
- Cập nhật `src/dialogue.js` và `src/main.js`:
  - Tích hợp QuestEngine vào cây hội thoại NPC:
    - Khi có quest sẵn sàng: NPC mời nhận quest ("Welcome to WordQuest! Can you find the blue Book on the desk and practice saying its name?").
    - Khi đang làm quest: NPC nhắc nhở mục tiêu.
    - Khi hoàn thành mục tiêu: NPC chúc mừng và trao phần thưởng ("Congratulations! You pronounced it perfectly!").
  - Hiển thị HUD Quest Tracker ở góc màn hình (hiển thị mục tiêu hiện tại).
  - Tích hợp giao diện thử thách phát âm với icon Micro và nút Fallback chuyển sang gõ text khi cần.
  - Hiển thị banner chúc mừng "Quest Completed!" kèm hiệu ứng huy hiệu rực rỡ khi trả quest.
- Cập nhật `src/style.css` và `index.html`:
  - Thiết kế HUD Quest Tracker, Voice Challenge Overlay và Quest Complete Banner phong cách game hiện đại.

## Interface contract

- `export class DialogueManager { constructor(container); show(dialogueNode, onSelect); close(); isOpen(); }`

## Intent coverage

- SC1
- SC2
- SC3
- SC4

## Acceptance criteria

1. AC1: Khi người chơi tương tác với NPC hoặc đồ vật có quest, giao diện hiển thị mục tiêu rõ ràng và hướng dẫn người chơi thực hiện.
2. AC2: NPC giao nhiệm vụ tìm kiếm đồ vật học tập cụ thể trong phòng và yêu cầu phát âm chính xác từ vựng tiếng Anh của vật thể đó.
3. AC3: Người chơi bấm nút microphone và nói từ tiếng Anh vào mic để SpeechRecognition nhận diện; nếu không có mic hoặc trình duyệt không hỗ trợ, tự động kích hoạt chế độ gõ chữ / trắc nghiệm Fallback để người chơi vẫn hoàn thành thử thách.
4. AC4: Khi hoàn thành phát âm đúng từ vựng và quay lại báo cáo NPC, hiển thị thông báo chúc mừng hoàn thành quest ("Quest Complete!") kèm hiệu ứng ăn mừng và huy hiệu thưởng.

## Verify

```bash
test -f src/quest.js && test -f src/voice.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
