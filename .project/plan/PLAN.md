# Plan — 3d-core-and-movement

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm install && npm run build`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Thiết lập cấu trúc dự án Vite + Three.js, dựng khung cảnh 3D cơ bản (Scene, Camera, Renderer, sàn và ánh sáng) đảm bảo hiệu năng tải trang và render 60 FPS.
Review depth: full

## Wave 2 — walking skeleton

Goal: Hoàn thiện nhân vật 3D với bộ điều khiển di chuyển WASD, camera góc nhìn thứ 3 bám theo và hoạt ảnh chuyển đổi idle/walk.
Review depth: full

## Surface contract

### web app — T002

Criteria: SC1, SC2, SC3
Entry: http://localhost:5173
States: Empty (chưa tải trang web), Loading (đang khởi tạo WebGL context và nạp tài nguyên), Error (trình duyệt không hỗ trợ WebGL), Success (canvas 3D hiển thị không gian, nhân vật di chuyển mượt mà bằng WASD và camera bám theo ở 60 FPS).
Walkthrough:
1. Chạy lệnh `npm run dev` để khởi động máy chủ phát triển Vite.
2. Mở trình duyệt truy cập `http://localhost:5173`.
3. Kiểm tra trang web tải nhanh dưới 3 giây và duy trì 60 FPS.
4. Nhấn các phím W, A, S, D hoặc phím mũi tên để điều khiển nhân vật di chuyển và xoay hướng, camera bám theo mượt mà.
5. Quan sát hoạt ảnh nhân vật chuyển đổi mượt mà giữa trạng thái đứng yên (idle) và bước đi (walk).

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC4 |
| SC2 | T002 | AC1 |
| SC3 | T002 | AC3 |
