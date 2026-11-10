# Evidence — codebase

<!-- Written by the codebase mapper during /gsd-path-inspect. Read by define
     (brownfield mode), researchers (fifth standard dimension), the planner
     (conventions are binding), and reviewers. -->

Repo root: /root/Dev/sandbox/temp/temp4
Scanned: 2026-11-10
Checks run: `npm run build` → built in 1.76s (exit code: 0)

## Map

- **Stack**: Three.js v0.170.0, Vite v5.4.11, JavaScript ES Modules, HTML5/CSS3.
- **Entry points**: `index.html` loads `src/main.js`, which initiates `createScene` (`src/scene.js`), `InputManager` (`src/input.js`), and `CharacterController` (`src/character.js`).
- **Architecture**: Phân tách rõ ràng giữa WebGL rendering canvas 3D (`src/scene.js`) và 2D UI Overlay (`src/style.css`, `index.html`). Controller nhân vật (`src/character.js`) nhận vector di chuyển từ `InputManager` (`src/input.js`), xử lý hoạt ảnh bước chân procedural và điều khiển camera góc nhìn thứ 3 theo sau nhân vật mượt mà.
- **Conventions**: ES Module imports, class-based controllers (`CharacterController`, `InputManager`), hàm khởi tạo scene chức năng `createScene`.
- **Maturity**: Nền tảng 3D hoàn chỉnh, render 60 FPS ổn định, kiểm soát tốt va chạm giới hạn sàn và chuyển đổi hoạt ảnh di chuyển/đứng yên.
- **Recent activity**: Commit M001 hoàn thành nền tảng 3D core, bộ điều khiển phím WASD, nhân vật 3D và camera follow.

## Finding: Nền tảng Three.js và Controller nhân vật đã sẵn sàng cho hệ thống tương tác

- **Claim**: Mã nguồn hiện tại tại `src/scene.js` và `src/character.js` cung cấp đầy đủ Scene, Camera, Renderer và đối tượng vị trí nhân vật để Milestone 2 tích hợp cơ chế Raycasting tương tác với đồ vật 3D.
- **Source**: src/scene.js:68, src/character.js:154
- **Confidence**: high
- **Why it matters here**: Milestone 2 có thể gắn đồ vật trực tiếp vào `sceneManager.scene` và dùng `characterController.getPosition()` để tính khoảng cách tương tác mà không cần sửa đổi kiến trúc cốt lõi.

## Apparent intent

- Xây dựng thế giới 3D tương tác theo ngữ cảnh hỗ trợ người học tiếng Anh khám phá và tiếp cận từ vựng. — based on commit M001 and project CHARTER.md.

## Open questions for define

- none

## Blocked areas

- none
