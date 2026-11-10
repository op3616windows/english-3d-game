---
id: T002
title: Xây dựng bộ điều khiển nhân vật và hoạt ảnh di chuyển
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/character.js
  - src/input.js
  - src/main.js
---

# T002 — Xây dựng bộ điều khiển nhân vật và hoạt ảnh di chuyển

## Context

Bổ sung nhân vật 3D góc nhìn thứ 3 và cơ chế điều khiển di chuyển theo thời gian thực cho game WordQuest. Kết nối bộ quản lý phím bấm (WASD/phím mũi tên) với chuyển động của nhân vật, camera follow bám theo sau lưng và hệ thống hoạt ảnh AnimationMixer (idle/walk) đáp ứng SC2 và SC3 trong INTENT.md.

## Approach

- Viết file src/input.js với class InputManager lắng nghe keydown/keyup cho W, A, S, D và Arrow keys, trả về hướng di chuyển (x, z) và trạng thái isMoving.
- Viết file src/character.js với class CharacterController tạo nhân vật 3D (sử dụng Three.Group với mesh cơ thể low-poly hình người hoặc Capsule geometry kèm chân tay), tích hợp AnimationMixer điều khiển hoạt ảnh nhịp bước chân (procedural walk hoặc mixer clips).
- Cập nhật camera trong createScene hoặc CharacterController bám theo sau lưng nhân vật với góc nhìn chéo từ trên xuống (Third-person follow offset: ví dụ x: 0, y: 5, z: 8).
- Trong src/main.js, kết nối InputManager, CharacterController vào vòng lặp update(delta) của scene.

## Interface contract

- `export function createScene(container): { scene, camera, renderer, update(delta) }`

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. AC1: File src/input.js bắt chính xác sự kiện phím WASD và phím mũi tên, trả về vector di chuyển chuẩn hóa.
2. AC2: File src/character.js tạo nhân vật 3D, cập nhật vị trí theo vector di chuyển và xoay nhân vật theo hướng đi.
3. AC3: Hoạt ảnh nhân vật chuyển đổi mượt mà giữa idle và walk khi bắt đầu di chuyển hoặc dừng lại.
4. AC4: Camera góc nhìn thứ 3 theo sau nhân vật mượt mà, duy trì tốc độ 60 FPS khi di chuyển.

## Verify

```bash
test -f src/character.js && test -f src/input.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
