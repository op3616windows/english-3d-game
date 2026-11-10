# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Single-player focus — Trải nghiệm web 3D tập trung hoàn toàn vào cá nhân hóa người học, không làm multiplayer (Charter veto)
- Asset budget — Ưu tiên tài nguyên Low-poly tối ưu tải trang dưới 15MB, không dùng texture 4K (Charter veto)
- Storage — Tiến độ và cài đặt lưu trữ trực tiếp trên LocalStorage / IndexedDB của trình duyệt (Charter constraints)

## Decisions

### 3D Framework and Asset Pipeline

- **Decision**: Sử dụng Three.js (ES modules đóng gói qua Vite) kết hợp GLTFLoader và DRACOLoader để tải mô hình 3D nhân vật và thị trấn Low-poly.
- **Runner-up**: Unity WebGL hoặc React Three Fiber (R3F). Unity WebGL có dung lượng ban đầu quá nặng (>30MB) và tải chậm; R3F tạo thêm lớp trừu tượng React không cần thiết cho game loop và canvas rendering trực tiếp.
- **Evidence**: evidence-stack.md § Three.js GLTFLoader kết hợp DRACOLoader là chuẩn tối ưu cho asset 3D trên web
- **Confidence**: high

### Speech Recognition and Fallback Strategy

- **Decision**: Sử dụng Web Speech API native của trình duyệt cho tính năng phát âm và nhận diện giọng nói, kết hợp VoiceController có cơ chế tự động fallback sang gõ từ (Spelling Input) hoặc trắc nghiệm khi không có quyền micro hoặc trên trình duyệt không hỗ trợ.
- **Runner-up**: Bắt buộc micro 100% hoặc tích hợp Whisper WASM chạy local. Bắt buộc micro làm mất người dùng trên Firefox hoặc môi trường ồn ào; Whisper WASM tiêu tốn CPU/GPU làm giảm FPS của Three.js.
- **Evidence**: evidence-pitfalls.md § Hạn chế hỗ trợ Web Speech API trên Firefox và iOS Safari, evidence-pitfalls.md § Cơ chế Graceful Fallback dạng Multiple Choice và Text Input
- **Confidence**: high

### UI Layer and Vocabulary Cards Architecture

- **Decision**: Tách biệt Canvas WebGL 3D ở layer dưới và 2D UI Overlay (HTML/CSS/Tailwind) ở layer trên để hiển thị HUD, Card từ vựng (IPA, audio, nghĩa), hộp thoại NPC và túi đồ, kết nối thông qua Event Emitter nhẹ.
- **Runner-up**: Dựng TextGeometry và 3D UI Panel trực tiếp bên trong scene Three.js. Tiêu tốn nhiều draw calls và vertices, khó căn chỉnh responsive trên các kích thước màn hình khác nhau và khó hiển thị chuẩn ký tự phiên âm IPA.
- **Evidence**: evidence-stack.md § Kiến trúc phân tách Three.js Scene Controller và 2D UI Overlay
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: Khởi tạo Vite + Three.js template sạch, thiết lập character controller góc nhìn thứ 3 với va chạm mặt đất và camera follow mượt mà.
- **Walking skeleton**: Nhân vật di chuyển trong một phòng 3D cơ bản, tiến lại gần một vật thể (ví dụ: chiếc bàn / quả táo), click vào vật thể kích hoạt mở Card từ vựng và phát âm audio qua Web Speech API.
- **Pitfalls → tasks**: Thiết kế module VoiceController kiểm tra quyền truy cập micro ngay khi bắt đầu nhiệm vụ nói và cung cấp nút chuyển sang chế độ gõ chữ khi micro không khả dụng.

## User rulings

- none

## Still unknown

- none
