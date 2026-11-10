---
id: T001
title: Thiết lập dự án Vite Three.js và khung cảnh 3D cơ bản
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - package.json
  - index.html
  - src/main.js
  - src/style.css
  - src/scene.js
---

# T001 — Thiết lập dự án Vite Three.js và khung cảnh 3D cơ bản

## Context

Khởi tạo nền móng ứng dụng web 3D cho dự án game học tiếng Anh WordQuest. Thiết lập dự án Vite với thư viện Three.js, cấu hình renderer, camera và ánh sáng cơ bản, tạo mặt sàn và vòng lặp render tối ưu để đạt hiệu năng 60 FPS theo tiêu chí SC1 của INTENT.md.

## Approach

- Khởi tạo package.json với scripts dev và build sử dụng Vite, dependencies gồm three.
- Tạo index.html với thẻ canvas toàn màn hình và nạp file src/main.js.
- Viết file src/style.css reset margin/padding, ẩn thanh cuộn và căn canvas tràn màn hình.
- Viết file src/scene.js xuất hàm `createScene(container)` khởi tạo Three.Scene, Three.PerspectiveCamera, Three.WebGLRenderer (antialias: true, shadowMap bật), AmbientLight, DirectionalLight và sàn 3D (GridHelper và PlaneMesh).
- Trong src/main.js, khởi tạo vòng lặp RequestAnimationFrame tính delta time và gọi hàm cập nhật scene.

## Interface contract

- `export function createScene(container): { scene, camera, renderer, update(delta) }`

## Intent coverage

- SC1

## Acceptance criteria

1. AC1: File package.json chứa dependencies `three` và scripts `dev`, `build` hoạt động bình thường qua Vite.
2. AC2: File src/scene.js khởi tạo đầy đủ Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight và mặt sàn 3D.
3. AC3: Lệnh build production tạo thành công thư mục dist chứa bundle hoàn chỉnh không phát sinh lỗi cú pháp.

## Verify

```bash
test -f package.json && test -f src/scene.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
