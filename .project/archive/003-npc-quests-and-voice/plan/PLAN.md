# Plan — npc-quests-and-voice

<!-- Written by the planner role. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm install && npm run build`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Dựng mô hình nhân vật NPC 3D với animation vẫy tay chào, cơ chế phát hiện tiếp cận và hệ thống hộp thoại hội thoại phân nhánh 2D UI Dialogue Box.
Review depth: full

## Wave 2 — walking skeleton

Goal: Hoàn thiện Quest Engine quản lý vòng đời nhiệm vụ học tập, tích hợp nhận diện giọng nói qua microphone (Web Speech API SpeechRecognition) với cơ chế Fallback gõ chữ/trắc nghiệm và thông báo chúc mừng hoàn thành quest.
Review depth: full

## Surface contract

### web app — T002

Criteria: SC1, SC2, SC3, SC4
Entry: http://localhost:5173
States: Empty (chưa tải trang web), Loading (đang nạp WebGL context và mô hình NPC), Error (trình duyệt không hỗ trợ WebGL hoặc SpeechRecognition gặp sự cố và kích hoạt fallback), Success (khung cảnh 3D hiển thị NPC và phòng học; tiếp cận NPC mở hộp thoại đối thoại; nhận quest tìm đồ vật; nói vào micro hoặc gõ text fallback để hoàn thành phát âm; trả quest nhận thông báo chúc mừng).
Walkthrough:
1. Chạy lệnh `npm run dev` và truy cập `http://localhost:5173`.
2. Dùng các phím WASD điều khiển nhân vật lại gần NPC (Teacher Alex).
3. Đứng gần NPC thấy gợi ý tương tác và nhấp chuột hoặc nhấn phím 'E' để mở hộp thoại hội thoại tiếng Anh (SC1).
4. Đọc lời chào của NPC và chọn đồng ý nhận nhiệm vụ tìm đồ vật trong phòng (SC2).
5. Di chuyển đến đồ vật được yêu cầu (ví dụ cuốn sách Book), tương tác để mở thử thách phát âm.
6. Nhấn nút micro và phát âm to từ tiếng Anh để hệ thống nhận diện, hoặc chuyển sang chế độ gõ từ fallback nếu không dùng micro (SC3).
7. Quay lại gặp NPC để trả nhiệm vụ, quan sát hộp thoại chúc mừng hoàn thành quest kèm hiệu ứng ăn mừng (SC4).

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |

## Dependency notes

T002 cần hệ thống NPC 3D và hộp thoại DialogueManager do T001 xây dựng để hiển thị các tùy chọn nhận nhiệm vụ, nộp nhiệm vụ và kết nối với QuestEngine.
