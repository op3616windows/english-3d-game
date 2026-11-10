# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: /root/Dev/sandbox/temp/temp4
Scanned: 2026-11-10
Checks run: `npm run build` → built in 1.85s (exit code: 0)

## Map

- **Stack**: Three.js v0.170.0, Vite v5.4.11, JavaScript ES Modules, HTML5/CSS3, Web Speech API (SpeechSynthesis).
- **Entry points**: `index.html` loads `src/main.js`, which sets up `createScene`, `InputManager`, `CharacterController`, `InteractableManager`, `VocabModal`, and `AudioService`.
- **Architecture**: Kiến trúc module hóa tách bạch rõ ràng giữa WebGL 3D Canvas và 2D UI Overlay. `InteractableManager` quản lý raycasting và kiểm tra khoảng cách gần với người chơi. `VocabModal` và `AudioService` quản lý giao diện học từ vựng 2D và âm thanh phát âm bản ngữ.
- **Conventions**: ES Module imports, OOP classes (`CharacterController`, `InputManager`, `InteractableManager`, `VocabModal`, `AudioService`), decoupled DOM events.
- **Maturity**: Hoàn chỉnh 3D movement, tương tác đồ vật 3D, thẻ từ vựng 2D modal và phát âm audio speechSynthesis với 60 FPS ổn định.
- **Recent activity**: Commit M002 (`3feecca6bda8e4692fe12f6898fdcde2495e0992`) hoàn thành tương tác đồ vật 3D, highlight, Thẻ từ vựng song ngữ 2D và Web Speech API audio.

## Finding: Nền tảng tương tác và audio đã sẵn sàng mở rộng cho NPC và Quest Engine

- **Claim**: Kiến trúc `InteractableManager`, `AudioService` và modal overlay hiện tại đã có cơ chế kiểm tra khoảng cách gần, tạm dừng điều khiển nhân vật và tích hợp Web Speech API, cung cấp nền tảng vững chắc để triển khai NPC 3D và hộp thoại nhiệm vụ.
- **Source**: src/interactables.js:125, src/audio.js:25, src/vocabModal.js:100
- **Confidence**: high
- **Why it matters here**: Milestone 3 có thể dễ dàng bổ sung NPC như một thực thể tương tác đặc biệt, mở rộng AudioService để hỗ trợ Web Speech API SpeechRecognition (nhận diện giọng nói microphone) kèm fallback gõ chữ/trắc nghiệm.

## Apparent intent

- Phát triển game nhập vai học tiếng Anh 3D tương tác hoàn chỉnh trên web với NPC giao quest và thử thách phát âm bằng giọng nói. — based on commit M002 and project CHARTER.md.

## Open questions for define

- none

## Blocked areas

- none
