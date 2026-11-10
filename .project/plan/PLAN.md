# Plan — English 3D Game (WordQuest) - M005

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --prefer-offline && npm run build`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Tách kiến trúc phòng đơn sang ZoneManager đa phân cảnh, tạo cổng dịch chuyển (Door Portals) với hiệu ứng chuyển cảnh mượt mà (<1s, debounce 1.5s) và hàm giải phóng tài nguyên Three.js (dispose).
Review depth: full

## Wave 2 — walking skeleton

Goal: Bổ sung bộ từ vựng 3D theo từng chủ đề phòng, giao diện Minimap 2D và bảng thông báo khu vực trên HUD.
Review depth: full

## Surface contract

### web app — T002

Criteria: SC2, SC3
Entry: Mở trình duyệt truy cập ứng dụng web chạy trên Vite dev server
States:
- empty: Màn hình loading khởi tạo canvas WebGL và các thành phần DOM
- success: Không gian 3D tương tác đa phòng hiển thị ở 60 FPS kèm Minimap định vị và HUD Zone Indicator
Walkthrough:
1. Mở ứng dụng web trên trình duyệt, quan sát nhân vật trong phòng học.
2. Di chuyển nhân vật bước qua cửa/cổng dịch chuyển sang phòng khách hoặc phòng bếp.
3. Quan sát hiệu ứng chuyển cảnh mượt mà (<1s), tên phòng mới hiển thị trên HUD và bản đồ Minimap cập nhật vị trí.
4. Rê chuột và nhấp vào đồ vật 3D mới (sofa, tivi, tủ lạnh, cốc cà phê...) để xem thẻ từ vựng và nghe phát âm.

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T002 | AC3 |
| SC4 | T001 | AC4 |

## Dependency notes

T002 cần ZoneManager từ T001 để biết thông tin phòng hiện tại (activeZone), kích thước phòng và lắng nghe sự kiện chuyển đổi phòng (onZoneChange) nhằm nạp đồ vật từ vựng và cập nhật Minimap tương ứng.
