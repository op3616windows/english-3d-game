# Plan — gamification-and-progression

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm install && npm run build`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Xây dựng hệ thống Túi đồ từ vựng (Inventory UI) dạng lưới có thể xem lại phát âm/nghĩa mọi lúc, cùng hệ thống tính điểm kinh nghiệm (XP), thanh tiến trình và cơ chế thăng cấp (Level Up).
Review depth: full

## Wave 2 — walking skeleton

Goal: Tích hợp module lưu trữ LocalStorage tự động đồng bộ hóa và khôi phục tiến trình học tập (XP, cấp độ, túi đồ, quest) sau khi tải lại trang (F5), hoàn thiện thẩm mỹ HUD và liên kết toàn diện vòng lặp trải nghiệm học tiếng Anh 3D.
Review depth: full

## Surface contract

### web app — T002

Criteria: SC1, SC2, SC3
Entry: http://localhost:5173
States: Empty (chưa mở ứng dụng hoặc túi đồ rỗng), Loading (khởi tạo Three.js scene và nạp dữ liệu LocalStorage), Error (LocalStorage bị chặn trong Incognito mode -> tự động fallback in-memory an toàn), Success (người chơi di chuyển trong phòng học 3D, mở túi đồ xem danh sách từ vựng bất kỳ lúc nào, thanh XP và cấp độ cập nhật mượt mà, tải lại trang F5 giữ nguyên toàn bộ tiến độ).
Walkthrough:
1. Chạy lệnh `npm run dev` và truy cập `http://localhost:5173`.
2. Quan sát thanh tiến trình XP, cấp độ (Level 1) và nút Túi đồ trên HUD header.
3. Nhấn phím 'I' hoặc click nút Túi đồ trên HUD để mở Inventory; quan sát trạng thái trống ban đầu (E1).
4. Tương tác với đồ vật 3D trong phòng (hoặc hoàn thành quest với NPC Teacher Alex) để nhận từ vựng vào túi đồ và nhận điểm XP (SC1, SC2).
5. Khi đủ XP thăng cấp (Level 2), quan sát thông báo Level Up chúc mừng và thanh tiến trình cập nhật chính xác (E2).
6. Mở lại Túi đồ bằng phím 'I' để xem lại từ vựng đã thu thập, bấm nút loa để nghe lại phát âm (SC1).
7. Nhấn phím F5 để tải lại trang web; quan sát cấp độ, điểm XP và danh sách từ vựng trong túi đồ vẫn được giữ nguyên vẹn từ LocalStorage (SC3, E3).

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T001 | AC2 |
| SC2 | T002 | AC1 |
| SC3 | T002 | AC1 |

## Dependency notes

T002 cần các lớp InventoryManager và ProgressionManager của T001 để gắn kết với StorageService và khôi phục trạng thái đã lưu vào giao diện.
