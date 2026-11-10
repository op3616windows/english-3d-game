---
id: T002
title: Tích hợp bộ từ vựng 3D theo chủ đề phòng, giao diện Minimap và thông báo khu vực trên HUD
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/interactables.js
  - src/minimap.js
  - src/main.js
  - src/style.css
---

# T002 — Tích hợp bộ từ vựng 3D theo chủ đề phòng, giao diện Minimap và thông báo khu vực trên HUD

## Context

Sau khi T001 hoàn thành hạ tầng ZoneManager và hệ thống cổng dịch chuyển phòng, T002 sẽ đưa nội dung từ vựng 3D phong phú vào các phòng mới (Phòng khách, Nhà bếp/quán ăn), đồng thời bổ sung giao diện Minimap 2D và bảng thông báo khu vực trên HUD giúp người chơi định hướng vị trí và không gian dễ dàng.

## Approach

- Bổ sung cấu trúc dữ liệu từ vựng theo `zoneId` trong `src/interactables.js`.
- Bố trí các mô hình 3D đại diện cho từ vựng mới:
  - `living_room`: Sofa, Television, Floor Lamp, Wall Clock, Painting, Coffee Table, Bookshelf...
  - `kitchen_cafe`: Refrigerator, Microwave Oven, Coffee Cup, Teapot, Bread, Blender, Dining Table...
- Mỗi đồ vật từ vựng đều liên kết với thẻ học đầy đủ thông tin: từ tiếng Anh, phiên âm IPA, nghĩa tiếng Việt, câu ví dụ và chức năng phát âm giọng đọc.
- Phát triển `src/minimap.js` vẽ canvas 2D biểu diễn sơ đồ phòng thu nhỏ, hiển thị vị trí và góc nhìn của nhân vật thời gian thực.
- Thêm HUD Zone Banner trong `src/style.css` và `src/main.js` hiển thị tên phân cảnh trang nhã mỗi khi bước vào khu vực mới.

## Interface contract

- Export `ZoneManager` class from `src/zoneManager.js`:
  - `constructor(sceneManager)`
  - `getCurrentZone(): { id: string, name: string, bounds: { width: number, depth: number } }`
  - `onZoneChange(callback: (zone: { id: string, name: string }) => void): void`
  - `switchZone(zoneId: string): Promise<boolean>`
  - `checkPortalOverlap(playerPos: THREE.Vector3): string | null`

## Intent coverage

- SC2
- SC3

## Acceptance criteria

1. `src/interactables.js` mở rộng danh sách từ vựng theo từng khu vực: `living_room` (sofa, television, lamp, carpet, clock, painting...) và `kitchen_cafe` (refrigerator, oven, coffee cup, teapot, bread, blender...) với đầy đủ IPA, nghĩa tiếng Việt và phát âm audio chuẩn.
2. `InteractableManager` nạp và hiển thị đúng bộ đồ vật tương ứng với phòng đang hoạt động (`activeZone`), hỗ trợ raycasting hover highlight và click mở modal từ vựng.
3. `src/minimap.js` khởi tạo thành phần Minimap 2D ở góc trên màn hình, vẽ sơ đồ thu nhỏ của phòng hiện tại và chấm định vị vị trí/hướng xoay của người chơi thời gian thực.
4. Giao diện hiển thị Zone Banner / Indicator thông báo tên phòng (ví dụ: "Living Room - Phòng khách", "Kitchen & Cafe - Nhà bếp & Quán cà phê") mỗi khi chuyển sang phòng mới.

## Verify

```bash
node --check src/minimap.js
```

Heavy: no

## Log

- 2026-11-11 — created by planner
