---
id: T002
title: Xây dựng Thẻ từ vựng 2D Modal và tích hợp Web Speech API phát âm chuẩn
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - index.html
  - src/style.css
  - src/vocabModal.js
  - src/audio.js
  - src/input.js
  - src/main.js
---

# T002 — Xây dựng Thẻ từ vựng 2D Modal và tích hợp Web Speech API phát âm chuẩn

## Context

Sau khi hệ thống 3D đã có các đồ vật tương tác và cơ chế Raycasting ở T001, bước tiếp theo là xây dựng trải nghiệm học từ vựng trực quan thông qua Thẻ từ vựng 2D Overlay. Khi người chơi click vào đồ vật hoặc nhấn phím E trong phạm vi gần, giao diện thẻ từ vựng mở ra với thiết kế hiện đại, typography sắc nét hiển thị đầy đủ phiên âm IPA, nghĩa tiếng Việt và câu ví dụ minh họa. Đồng thời, tính năng phát âm bản ngữ chuẩn qua Web Speech API giúp người học nghe rõ cách đọc từ vựng.

## Approach

- Tạo file `src/audio.js` chứa class `AudioService`:
  - Kiểm tra tính sẵn sàng của `window.speechSynthesis`.
  - Hàm `speak(text, lang = 'en-US')`: gọi `window.speechSynthesis.cancel()` trước khi tạo `new SpeechSynthesisUtterance(text)` để tránh chồng lấn âm thanh khi bấm nhanh liên tục (đáp ứng E3 và N3).
  - Thiết lập giọng đọc chuẩn tiếng Anh (ưu tiên giọng `en-US` tự nhiên nếu có trong `getVoices()`).
- Tạo file `src/vocabModal.js` chứa class `VocabModal`:
  - Tạo cấu trúc DOM modal thẻ từ vựng trong `#ui-overlay` hoặc phần tử cha phù hợp:
    - Nút đóng (X) ở góc phải.
    - Huy hiệu phân loại (danh từ/đồ vật).
    - Tiêu đề từ vựng tiếng Anh (kích thước lớn, nổi bật).
    - Phiên âm quốc tế IPA (font chữ chuyên dụng, màu phụ trợ dịu mắt).
    - Nút phát âm (icon loa âm thanh) gọi `AudioService.speak()`.
    - Nghĩa tiếng Việt rõ ràng, dễ hiểu.
    - Khối ví dụ thực tế (Example sentence) kèm bản dịch.
  - Quản lý trạng thái mở/đóng modal:
    - Hỗ trợ đóng khi click nút X, click vào backdrop bên ngoài thẻ, hoặc nhấn phím `Escape`.
    - Khi mở modal, gọi `inputManager.setEnabled(false)` để tạm dừng nhận lệnh di chuyển WASD, tránh nhân vật đi lạc khi đang đọc thẻ từ vựng (đáp ứng E2 và N2).
    - Khi đóng modal, gọi `inputManager.setEnabled(true)` để khôi phục di chuyển bình thường.
- Cập nhật `src/input.js`:
  - Thêm phương thức `setEnabled(enabled)` và `reset()` để khóa/mở nhận lệnh phím khi mở thẻ từ vựng.
- Cập nhật `src/style.css` và `index.html`:
  - Định dạng modal responsive, kính mờ (`backdrop-filter: blur`), bo góc mềm mại, đổ bóng hiện đại và typography đẹp mắt.
  - Thiết lập thuộc tính `pointer-events: auto` cho modal để người dùng nhấp chuột tương tác bình thường trong khi canvas bên dưới vẫn nhận pointer events khi modal đóng.
- Trong `src/main.js`:
  - Lắng nghe sự kiện click chuột trên canvas và sự kiện nhấn phím `KeyE`.
  - Nếu đối tượng đang được hover hoặc nằm trong cự ly gần, kích hoạt mở `vocabModal.open(vocabData)`.

## Interface contract

- `export class InteractableManager { constructor(scene, camera, domElement); addInteractable(meshOrGroup, vocabData); update(playerPosition); getNearbyInteractable(playerPosition, maxDistance); dispose(); }`

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. AC1: Nhấp chuột vào đồ vật đang highlight hoặc nhấn phím 'E' trong cự ly cho phép sẽ mở thành công Thẻ từ vựng 2D Overlay trên màn hình.
2. AC2: Thẻ từ vựng hiển thị chuẩn xác và đầy đủ các trường thông tin: từ vựng tiếng Anh, phiên âm quốc tế IPA, giải nghĩa tiếng Việt và câu ví dụ minh họa ngữ cảnh.
3. AC3: Nhấp vào nút phát âm trên thẻ kích hoạt Web Speech API đọc to từ vựng với ngữ điệu tiếng Anh chuẩn; bấm nhiều lần liên tục không gây chồng chéo âm thanh hoặc đứng trình duyệt.
4. AC4: Đóng thẻ từ vựng thông qua nút đóng, phím Escape hoặc nhấp ra ngoài modal; giải phóng trạng thái khóa phím và khôi phục khả năng di chuyển nhân vật ngay lập tức.

## Verify

```bash
test -f src/vocabModal.js && test -f src/audio.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
