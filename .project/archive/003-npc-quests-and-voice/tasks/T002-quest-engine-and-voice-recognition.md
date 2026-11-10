---
id: T002
title: Xây dựng Quest Engine, nhận diện giọng nói qua microphone và hoàn thành trả thưởng
wave: 2
deps:
  - T001
status: done
agent: Antigravity
base: 29fdc11268ed086d79ec43ddb13ef446c172c04b
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
- 2026-11-10 — implemented QuestEngine (src/quest.js) with full quest lifecycles, objective validation, and debounced rewards
- 2026-11-10 — implemented VoiceService (src/voice.js) with SpeechRecognition, 7-second safe timeout, fallback verification, and Web Audio chime fanfare
- 2026-11-10 — added VoiceChallengeModal, QuestCelebrationBanner, and QuestTrackerHUD in src/dialogue.js and styled in src/style.css
- 2026-11-10 — integrated QuestEngine, VoiceService, and modals in src/main.js and verified build successfully
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  vite v5.4.21 building for production...
  transforming...
  ✓ 15 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.71 kB │ gzip:   0.42 kB
  dist/assets/index-BdNf-IPD.css   13.38 kB │ gzip:   3.12 kB
  dist/assets/index-DHf8xV4W.js   524.73 kB │ gzip: 134.42 kB
  ✓ built in 1.95s
  npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```
- 2026-11-10 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  vite v5.4.21 building for production...
  transforming...
  ✓ 15 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.71 kB │ gzip:   0.42 kB
  dist/assets/index-BdNf-IPD.css   13.38 kB │ gzip:   3.12 kB
  dist/assets/index-DHf8xV4W.js   524.73 kB │ gzip: 134.42 kB
  ✓ built in 1.91s
  npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```
