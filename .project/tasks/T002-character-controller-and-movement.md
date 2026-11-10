---
id: T002
title: Xây dựng bộ điều khiển nhân vật và hoạt ảnh di chuyển
wave: 2
deps:
  - T001
status: done
agent: Antigravity
base: ec8e4069dae407e4db6662d207448644195ac6f1
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
- 2026-11-10 — implemented InputManager (WASD/arrows), CharacterController with low-poly humanoid mesh, floor boundary clamping, walk/idle procedural animation, and smooth third-person camera follow. Production build succeeded.
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  
  To address all issues (including breaking changes), run:
    npm audit fix --force
  
  Run `npm audit` for details.
  vite v5.4.21 building for production...
  transforming...
  ✓ 8 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.68 kB │ gzip:   0.39 kB
  dist/assets/index-C5of3Znb.css    0.94 kB │ gzip:   0.53 kB
  dist/assets/index-y5QHb2id.js   475.29 kB │ gzip: 120.32 kB
  ✓ built in 1.76s
  npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  ```
- 2026-11-10 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  
  To address all issues (including breaking changes), run:
    npm audit fix --force
  
  Run `npm audit` for details.
  vite v5.4.21 building for production...
  transforming...
  ✓ 8 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.68 kB │ gzip:   0.39 kB
  dist/assets/index-C5of3Znb.css    0.94 kB │ gzip:   0.53 kB
  dist/assets/index-y5QHb2id.js   475.29 kB │ gzip: 120.32 kB
  ✓ built in 1.73s
  npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  ```
