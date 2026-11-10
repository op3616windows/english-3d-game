# Synthesis — Milestone M005

<!-- Written by milestone mode. Cites program decisions and charter constraints. -->

## Settled

- Single-player focus: Trải nghiệm 3D cá nhân hóa, không multiplayer (Charter veto)
- Asset budget: Mô hình Low-poly procedural và nhẹ, tối ưu tải trang dưới 15MB (Charter veto)
- Storage persistence: Dữ liệu lưu trữ LocalStorage giữ nguyên khi chuyển phòng (Charter constraints, M004)
- 3D Framework: Three.js ES modules đóng gói qua Vite (Program Synthesis § 3D Framework and Asset Pipeline)
- UI Layer separation: Tách biệt Canvas 3D và 2D UI Overlay (Minimap, Zone Banner) (Program Synthesis § UI Layer and Vocabulary Cards Architecture)
- Success criteria: M005 SC1-SC4 bao gồm chuyển phòng dưới 1s qua cổng dịch chuyển, đồ vật từ vựng theo chủ đề, Minimap và 60 FPS không rò rỉ bộ nhớ (Roadmap M005)

## For the planner

- **Wave-1 blockers**: Khởi tạo `ZoneManager` quản lý đa phòng và cổng dịch chuyển (portals), giải phóng geometry/materials cũ khi chuyển cảnh.
- **Walking skeleton**: Người chơi bước qua cửa chuyển từ phòng học sang phòng khách/nhà bếp dưới 1s, hiển thị tên phòng và nạp đồ vật từ vựng theo chủ đề.
