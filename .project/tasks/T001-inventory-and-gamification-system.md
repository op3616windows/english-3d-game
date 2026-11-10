---
id: T001
title: Xây dựng hệ thống Túi đồ từ vựng và quản lý cấp độ kinh nghiệm (XP & Level)
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - index.html
  - src/style.css
  - src/progression.js
  - src/inventory.js
  - src/main.js
---

# T001 — Xây dựng hệ thống Túi đồ từ vựng và quản lý cấp độ kinh nghiệm (XP & Level)

## Context

Sau khi hoàn thành hệ thống nhiệm vụ và phát âm ở Milestone 3, người chơi cần một hệ thống quản lý phần thưởng và tiến trình học tập cụ thể: Túi đồ (Inventory) chứa các từ vựng đã học được để xem lại bất cứ lúc nào, cùng hệ thống thanh kinh nghiệm (XP) và cấp độ (Level) tạo động lực học tập.

## Approach

- Tạo file `src/inventory.js` chứa class `InventoryManager`:
  - Quản lý danh sách các mục từ vựng đã thu thập: `items = []`.
  - Phương thức `addItem(vocab)`: Thêm từ vựng vào túi đồ nếu chưa có (tránh trùng lặp), kích hoạt sự kiện cập nhật giao diện.
  - Phương thức `getItems()`: Trả về danh sách các từ vựng đã thu thập.
  - Tạo giao diện 2D Modal Túi đồ (`#inventory-modal`) dạng lưới card trực quan:
    - Hiển thị icon vật thể, từ tiếng Anh, phiên âm IPA, nghĩa tiếng Việt.
    - Nút loa nghe lại phát âm bản ngữ (dùng `AudioService`).
    - Trạng thái rỗng (empty state) khi chưa có vật phẩm với thông điệp hướng dẫn người chơi (đáp ứng E1).
    - Hỗ trợ phím tắt `I`, phím `Esc` và nút đóng (đáp ứng N1).
- Tạo file `src/progression.js` chứa class `ProgressionManager`:
  - Quản lý `level` (bắt đầu từ 1), `xp` hiện tại, và tính toán `xpForNextLevel`.
  - Công thức thăng cấp: mỗi cấp độ cần `level * 100` XP.
  - Phương thức `addXP(amount)`: cộng XP và kiểm tra điều kiện thăng cấp (Level Up).
  - Khi thăng cấp: hiển thị banner chúc mừng "LEVEL UP!" và phát âm thanh chuông mừng (đáp ứng E2, N3).
  - Cung cấp getter `getProgress()` để cập nhật thanh tiến trình XP trên HUD.
- Cập nhật `src/style.css` và `index.html`:
  - Bổ sung nút Túi đồ (🎒) trên HUD header.
  - Bổ sung thanh tiến trình XP và huy hiệu Level ở thanh tiêu đề HUD.
  - Định kiểu Modal Túi đồ dạng lưới hiện đại, responsive và animation Level Up.
- Cập nhật `src/main.js`:
  - Khởi tạo `InventoryManager` và `ProgressionManager`.
  - Lắng nghe sự kiện phím `I` để mở/đóng túi đồ.
  - Tự động cất từ vựng vào túi đồ và cộng XP khi người chơi tương tác với đồ vật 3D hoặc trả quest thành công.

## Interface contract

- `export class InventoryManager { constructor(container, audioService); addItem(vocab); getItems(); open(); close(); isOpen(); }`
- `export class ProgressionManager { constructor(); addXP(amount); getLevel(); getXP(); getNextLevelXP(); }`

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. AC1: Người chơi có thể mở Túi đồ bằng phím 'I' hoặc nút trên HUD để xem lại danh sách tất cả các từ vựng đã thu thập; mỗi item hiển thị từ tiếng Anh, phiên âm IPA, nghĩa tiếng Việt và có nút bấm nghe lại phát âm chuẩn bản ngữ.
2. AC2: Khi tương tác học từ vựng hoặc hoàn thành trả quest cho NPC, người chơi được cộng điểm kinh nghiệm XP; thanh tiến trình XP trên HUD cập nhật tức thì và tự động tăng cấp độ (Level Up) khi tích lũy đủ điểm.

## Verify

```bash
test -f src/inventory.js && test -f src/progression.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
