---
id: T001
title: Xây dựng các đồ vật 3D tương tác và hệ thống Raycasting kiểm tra khoảng cách gần
wave: 1
deps: []
status: done
agent: Antigravity
base: a044fb96fdcbec0a81a0be2c6555fb2c0a2df0e2
worktree: null
task_branch: null
files:
  - src/interactables.js
  - src/scene.js
  - src/main.js
---

# T001 — Xây dựng các đồ vật 3D tương tác và hệ thống Raycasting kiểm tra khoảng cách gần

## Context

Trong thế giới 3D của WordQuest, người chơi di chuyển xung quanh môi trường để khám phá từ vựng. Task này tạo các đồ vật 3D mang tính biểu tượng (bàn học, cuốn sách, quả táo, máy tính xách tay) được đặt trong scene với geometry low-poly rõ nét và màu sắc sinh động, gắn kèm dữ liệu từ vựng tiếng Anh. Hệ thống Raycasting và khoảng cách vị trí nhân vật được tích hợp để phát hiện khi người chơi hướng mắt hoặc đứng gần vật thể, kích hoạt hiệu ứng highlight phát sáng và hiển thị nhãn gợi ý tương tác.

## Approach

- Tạo file `src/interactables.js` chứa class `InteractableManager` và hàm tạo các mô hình đồ vật học tập 3D:
  - Bàn học (Desk): Mặt bàn gỗ và 4 chân bàn.
  - Cuốn sách (Book): Bìa sách màu sắc nổi bật đặt trên bàn hoặc kệ.
  - Quả táo (Apple): Khối cầu màu đỏ với cuống lá nhỏ.
  - Máy tính xách tay (Laptop): Thân máy và màn hình mở nghiêng.
  - Mỗi vật thể được bọc trong một `THREE.Group` hoặc `THREE.Mesh` với thuộc tính `userData.vocab`:
    ```javascript
    {
      id: 'book',
      word: 'Book',
      ipa: '/bʊk/',
      meaning: 'Sách, cuốn sách',
      example: 'She is reading an interesting English book.'
    }
    ```
- Xây dựng cơ chế Raycasting và Proximity check trong `InteractableManager`:
  - Lắng nghe sự kiện `pointermove` trên canvas để chuẩn hóa tọa độ chuột (Normalized Device Coordinates: x, y trong [-1, 1]).
  - Trong mỗi khung hình hoặc khi chuột di chuyển, bắn tia Raycaster từ camera qua tọa độ chuột.
  - Kiểm tra khoảng cách giữa vị trí nhân vật (`characterController.getPosition()`) và tọa độ thế giới của vật thể. Giới hạn khoảng cách tương tác (ví dụ tối đa 6 units).
  - Khi một vật thể nằm trong tầm tương tác và được hover (hoặc nhân vật đứng sát gần):
    - Đổi màu phát sáng (`material.emissive` hoặc tạo viền outline highlight).
    - Cập nhật thông điệp gợi ý trên HUD overlay (ví dụ: "Press E or Click to inspect [Word]").
  - Khi rời chuột hoặc đi ra xa, hoàn trả vật liệu gốc và ẩn nhãn gợi ý.
- Trong `src/scene.js` hoặc `src/main.js`, khởi tạo `InteractableManager`, thêm các vật thể vào scene và gọi hàm cập nhật trong vòng lặp `animate()`.

## Interface contract

- `export class InteractableManager { constructor(scene, camera, domElement); addInteractable(meshOrGroup, vocabData); update(playerPosition); getNearbyInteractable(playerPosition, maxDistance); dispose(); }`

## Intent coverage

- SC1

## Acceptance criteria

1. AC1: Tạo và đặt ít nhất 4 đồ vật 3D (Desk, Book, Apple, Laptop) trong scene với hình dạng low-poly sắc nét và gắn dữ liệu từ vựng tiếng Anh.
2. AC2: Khi rê chuột vào đồ vật hoặc di chuyển nhân vật đến gần trong phạm vi tương tác (<= 6 units), đồ vật phát sáng highlight (emissive) và nhãn hướng dẫn tương tác xuất hiện trên màn hình HUD.

## Verify

```bash
test -f src/interactables.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
- 2026-11-10 — implemented InteractableManager with Raycasting and character proximity detection, built low-poly 3D study props (table, book, apple, laptop, chair) with vocabulary metadata, emissive highlight shader and interactive HUD prompt. Production build succeeded.
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): pass, exit 0; output tail:
  ```
  
  To address all issues (including breaking changes), run:
    npm audit fix --force
  
  Run `npm audit` for details.
  vite v5.4.21 building for production...
  transforming...
  ✓ 9 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.68 kB │ gzip:   0.39 kB
  dist/assets/index-C5of3Znb.css    0.94 kB │ gzip:   0.53 kB
  dist/assets/index-BT-oskWa.js   486.36 kB │ gzip: 124.25 kB
  ✓ built in 1.84s
  npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  ```
