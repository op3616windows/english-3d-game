---
id: T001
title: Xây dựng nhân vật NPC 3D và hệ thống hộp thoại hội thoại phân nhánh
wave: 1
deps: []
status: done
agent: Antigravity
base: 24a3bf8136fbc6c112f82a2c9f227bc0d1b7f0b6
worktree: null
task_branch: null
files:
  - src/npc.js
  - src/dialogue.js
  - src/scene.js
  - src/main.js
---

# T001 — Xây dựng nhân vật NPC 3D và hệ thống hộp thoại hội thoại phân nhánh

## Context

Thế giới học tập WordQuest cần một người hướng dẫn thân thiện (NPC Teacher Alex) để tương tác, giao tiếp và hướng dẫn người chơi học tiếng Anh. Task này tạo nhân vật NPC 3D đặt trong scene với trang phục giáo viên đặc trưng, hoạt ảnh procedural vẫy tay chào và nhãn tên floating trên đầu. Tích hợp cơ chế phát hiện tiếp cận khi người chơi đến gần NPC (<= 5 units) và nhấn phím E hoặc click chuột để mở Hộp thoại hội thoại 2D (Dialogue Box) với câu hỏi tiếng Anh và các nút phản hồi lựa chọn phân nhánh.

## Approach

- Tạo file `src/npc.js` chứa class `NPCController`:
  - Xây dựng mô hình NPC 3D dạng low-poly phong cách đồng nhất với nhân vật chính (áo khoác tím/cam, tóc nâu, kính mắt tri thức).
  - Tích hợp hoạt ảnh procedural waving (cánh tay phải vẫy chào nhịp nhàng) và idle breathing.
  - Thêm thẻ tên 3D hoặc sprite nhãn "Teacher Alex" phía trên đầu.
  - Vị trí NPC đứng tại khu vực thuận tiện trong phòng (ví dụ x: 3.5, z: -2.0).
  - Phương thức `update(delta)`, `getPosition()`, `getMesh()`.
- Tạo file `src/dialogue.js` chứa class `DialogueManager`:
  - Quản lý giao diện hộp thoại hội thoại 2D ở phần dưới màn hình (`#dialogue-box`):
    - Khung avatar chân dung NPC với biểu cảm thân thiện.
    - Tên người nói ("Teacher Alex").
    - Đoạn thoại tiếng Anh (kèm phụ đề nghĩa tiếng Việt thu gọn nếu cần).
    - Danh sách các nút lựa chọn phản hồi (Response options).
    - Nút đóng và phím Escape để thoát khỏi hội thoại, tự động giải phóng điều khiển nhân vật.
  - Phương thức `show(dialogueNode, onSelect)`: hiển thị cây hội thoại.
  - Phương thức `close()`: đóng hộp thoại.
  - Phương thức `isOpen()`: kiểm tra trạng thái mở.
- Cập nhật `src/main.js`:
  - Khởi tạo `NPCController` và `DialogueManager`.
  - Kết nối vòng lặp `animate()` với `npcController.update(delta)`.
  - Kiểm tra khoảng cách giữa nhân vật chính và NPC; hiển thị gợi ý "Press E or Click to talk to Teacher Alex".
  - Tạm dừng di chuyển (`inputManager.setEnabled(false)`) khi mở hộp thoại hội thoại; khôi phục khi đóng.

## Interface contract

- `export class DialogueManager { constructor(container); show(dialogueNode, onSelect); close(); isOpen(); }`

## Intent coverage

- SC1

## Acceptance criteria

1. AC1: Tạo và đặt nhân vật NPC 3D trong scene với hoạt ảnh procedural vẫy tay chào; khi người chơi tiếp cận gần NPC (<= 5 units) và nhấp chuột hoặc nhấn phím 'E', hộp thoại hội thoại tiếng Anh mở ra mượt mà và tạm dừng di chuyển người chơi.

## Verify

```bash
test -f src/npc.js && test -f src/dialogue.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
- 2026-11-10 — implemented NPCController with procedural waving animation, floating 3D label badge, DialogueManager branching UI overlay with keyboard Escape and input lock/unlock hooks. Production build succeeded.
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): pass, exit 0; output tail:
  ```
  vite v5.4.21 building for production...
  transforming...
  ✓ 13 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.70 kB │ gzip:   0.41 kB
  dist/assets/index-Bfy9oUA0.css    3.80 kB │ gzip:   1.36 kB
  dist/assets/index-DrdIhE8N.js   504.98 kB │ gzip: 129.03 kB
  ✓ built in 1.84s
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
