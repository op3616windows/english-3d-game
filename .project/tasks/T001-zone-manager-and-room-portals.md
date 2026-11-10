---
id: T001
title: Xây dựng ZoneManager quản lý đa phân cảnh và hệ thống cửa dịch chuyển chuyển phòng
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/scene.js
  - src/zoneManager.js
---

# T001 — Xây dựng ZoneManager quản lý đa phân cảnh và hệ thống cửa dịch chuyển chuyển phòng

## Context

Hiện tại toàn bộ không gian 3D của WordQuest được cấu hình cố định trong một phòng học đơn lẻ trong `SceneManager`. Để mở rộng trò chơi sang nhiều chủ đề học tập, cần tách biệt quản lý không gian thành module `ZoneManager`, tạo lập các phân cảnh phòng học, phòng khách và nhà bếp kèm hệ thống cửa dịch chuyển (Door Portals) cho phép người chơi bước qua chuyển đổi phòng mượt mà.

## Approach

- Xây dựng `src/zoneManager.js` chứa lớp `ZoneManager`, nắm giữ dữ liệu cấu hình các phòng: `study_room`, `living_room`, `kitchen_cafe`.
- Mỗi phòng có kích thước phòng, màu sắc tường/sàn, ánh sáng riêng biệt và vị trí các cửa kết nối (portals).
- Tích hợp collider phát hiện va chạm giữa nhân vật và portal, kèm cơ chế debounce 1.5s để tránh chuyển cảnh lặp lại liên tục.
- Khi chuyển phòng, kích hoạt hiệu ứng fade mượt mà (<1s), dọn dẹp và giải phóng tài nguyên Three.js (`mesh.geometry.dispose()`, `material.dispose()`) của các vật thể phòng cũ, đưa nhân vật về điểm spawn của phòng mới và duy trì 60 FPS.
- Cập nhật `src/scene.js` để kết nối `ZoneManager` với chu trình render của Three.js.

## Interface contract

- Export `ZoneManager` class from `src/zoneManager.js`:
  - `constructor(sceneManager)`
  - `getCurrentZone(): { id: string, name: string, bounds: { width: number, depth: number } }`
  - `onZoneChange(callback: (zone: { id: string, name: string }) => void): void`
  - `switchZone(zoneId: string): Promise<boolean>`
  - `checkPortalOverlap(playerPos: THREE.Vector3): string | null`

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. `src/zoneManager.js` khởi tạo và quản lý cấu trúc các phân cảnh: `study_room` (phòng học), `living_room` (phòng khách), `kitchen_cafe` (nhà bếp & quán cà phê) với kích thước và màu sắc sàn/tường đặc trưng.
2. Tại mỗi phòng có ít nhất 1 cổng dịch chuyển (Door Portal) với hiệu ứng phát sáng nhẹ; khi nhân vật bước vào vùng collider của cửa, hệ thống gọi `switchZone()` chuyển sang phòng đích.
3. Cơ chế debounce 1.5s ngăn việc kích hoạt chuyển phòng liên tục khi nhân vật đứng tại vùng collider của cửa.
4. Quá trình chuyển phòng hiển thị hiệu ứng fade-to-black ngắn (<1s), dịch chuyển vị trí nhân vật đến điểm xuất phát an toàn của phòng mới và giải phóng triệt để hình học (`dispose()`), material và textures của phòng cũ, duy trì 60 FPS ổn định.

## Verify

```bash
node --check src/zoneManager.js
```

Heavy: no

## Log

- 2026-11-11 — created by planner
