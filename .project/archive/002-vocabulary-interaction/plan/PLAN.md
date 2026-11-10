# Plan — vocabulary-interaction

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm install && npm run build`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Thiết lập danh sách các đồ vật 3D tương tác (Desk, Book, Apple, Laptop) trong scene kèm metadata từ vựng, hệ thống Raycasting và proximity detection kích hoạt phát sáng highlight và hiển thị prompt tương tác.
Review depth: full

## Wave 2 — walking skeleton

Goal: Hoàn thiện Thẻ từ vựng 2D Overlay modal song ngữ (IPA, nghĩa tiếng Việt, câu ví dụ) và tích hợp Web Speech API phát âm chuẩn bản ngữ, xử lý đóng mở modal và khôi phục di chuyển nhân vật.
Review depth: full

## Surface contract

### web app — T002

Criteria: SC1, SC2, SC3
Entry: http://localhost:5173
States: Empty (chưa tải trang web), Loading (đang khởi tạo WebGL context và nạp mô hình 3D), Error (trình duyệt không hỗ trợ WebGL hoặc Web Speech API bị lỗi), Success (khung cảnh 3D hiển thị nhân vật và các đồ vật học tập; tiếp cận hoặc hover đồ vật kích hoạt highlight và nhãn tên; click chuột hoặc nhấn E mở thẻ từ vựng 2D với phát âm audio chuẩn).
Walkthrough:
1. Chạy lệnh `npm run dev` để khởi động máy chủ phát triển Vite và truy cập `http://localhost:5173`.
2. Dùng các phím W, A, S, D điều khiển nhân vật lại gần một đồ vật tương tác (ví dụ cuốn sách Book hoặc quả táo Apple).
3. Rê chuột hoặc tiếp cận đồ vật trong cự ly tương tác để quan sát vật thể phát sáng highlight và hiển thị prompt hướng dẫn trên HUD.
4. Nhấp chuột vào đồ vật hoặc nhấn phím 'E' để mở Thẻ từ vựng 2D Modal trên màn hình.
5. Quan sát thẻ hiển thị đầy đủ từ vựng tiếng Anh, phiên âm quốc tế IPA, giải nghĩa tiếng Việt và câu ví dụ minh họa ngữ cảnh.
6. Nhấp vào nút phát âm (biểu tượng loa) để nghe giọng phát âm bản ngữ rõ ràng thông qua Web Speech API.
7. Nhấn phím Escape hoặc nhấp nút đóng để tắt thẻ từ vựng và tiếp tục di chuyển nhân vật mượt mà.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |

## Dependency notes

T002 cần các đồ vật 3D tương tác và metadata từ vựng do T001 đăng ký trong scene để khi người chơi click hoặc nhấn E sẽ truyền đúng dữ liệu từ vựng vào modal 2D.
