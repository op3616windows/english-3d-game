# Intent — vocabulary-interaction

<!-- Written by /gsd-path-define milestone mode. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: web app

## Summary

Xây dựng hệ thống tương tác đồ vật 3D trong scene bằng Raycasting và hiển thị Thẻ từ vựng 2D Overlay kèm phát âm audio chuẩn. Khi người chơi rê chuột hoặc di chuyển nhân vật lại gần đồ vật (như bàn, ghế, sách, táo...), đồ vật sẽ phát sáng và hiển thị nhãn tên. Nhấp chuột vào đồ vật sẽ mở thẻ từ vựng song ngữ (IPA, nghĩa tiếng Việt, câu ví dụ) và cho phép nghe phát âm chuẩn bản ngữ qua Web Speech API.

## Problem

Người học cần tương tác trực tiếp với các đồ vật 3D cụ thể trong thế giới ảo để ghi nhớ từ vựng tiếng Anh theo ngữ cảnh thực tế thay vì chỉ nhìn danh sách từ vựng 2D tĩnh.

## Users

Người học tiếng Anh trải nghiệm học từ vựng trực quan qua game 3D trên trình duyệt.

## Success criteria

1. Khi rê chuột hoặc đưa nhân vật lại gần đồ vật 3D, đồ vật đổi màu viền/phát sáng và hiển thị nhãn tên vật thể trên màn hình.
2. Nhấp chuột vào đồ vật mở ra Thẻ từ vựng 2D chi tiết hiển thị đầy đủ phiên âm IPA và nghĩa tiếng Việt.
3. Nhấn nút phát âm trên thẻ từ vựng nghe được âm thanh phát âm tiếng Anh chuẩn rõ ràng.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | criterion SC1 | Khoảng cách tương tác giữa nhân vật và đồ vật được giới hạn hợp lý tránh click từ quá xa |
| E2 | SC2 | empty | criterion SC2 | Nhấp ra ngoài vùng thẻ từ vựng hoặc nhấn phím Escape đóng thẻ và khôi phục di chuyển |
| E3 | SC3 | idempotency | criterion SC3 | Nhấn nút phát âm nhiều lần liên tục không gây chồng chéo âm thanh hoặc treo Audio context |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | raycast liên tục làm sụt giảm FPS dưới 30 | criterion SC1 | Tối ưu hóa raycasting theo chu kỳ hoặc khi có sự kiện di chuột |
| N2 | SC2 | thẻ từ vựng kẹt trên màn hình hoặc khóa chết phím điều khiển | criterion SC2 | Xử lý focus và giải phóng trạng thái phím khi mở/đóng modal từ vựng |
| N3 | SC3 | phát âm bị câm hoặc crash trình duyệt khi Web Speech bận | criterion SC3 | Kiểm tra SpeechSynthesis sẵn sàng và hủy lệnh đọc cũ trước khi đọc lệnh mới |

## Scope: in

- Bố trí các đồ vật nội thất 3D (bàn, ghế, quả táo, cuốn sách, máy tính...) với collider/bounding box
- Hệ thống Raycaster hover/click phát hiện vật thể đang được trỏ chuột hoặc khi nhân vật đứng gần
- Hiệu ứng highlight/outline khi trỏ vào đồ vật
- 2D UI Overlay Card từ vựng (tên tiếng Anh, phiên âm IPA, nghĩa tiếng Việt, câu ví dụ thực tế)
- Tích hợp Web Speech API SpeechSynthesis hoặc Audio player phát âm chuẩn bản ngữ khi click biểu tượng loa

## Scope: out (vetoes)

- Nhận diện giọng nói qua microphone (thuộc M003)
- Chuỗi nhiệm vụ giao tiếp NPC (thuộc M003)
- Túi đồ và thanh tiến độ XP (thuộc M004)
- Multiplayer thời gian thực (Charter veto)

## Constraints

- Stack: Three.js, Vite, JavaScript ES modules, HTML5/CSS3, Web Speech API (SpeechSynthesis).
- Repository: https://github.com/op3616windows/english-3d-game
- Remote default: main
- GSD Path branch: gsd-path/M002
- Primary worktree: /root/Dev/sandbox/temp/temp4

## Current state (brownfield only)

- **What exists**: Cấu trúc Vite + Three.js với Scene, WebGLRenderer, PerspectiveCamera, sàn 3D, InputManager bắt phím WASD và CharacterController điều khiển nhân vật góc nhìn thứ 3 với animation idle/walk đạt 60 FPS.
- **Must not break**: Hệ thống điều khiển di chuyển WASD của nhân vật và camera góc nhìn thứ 3 bám theo.
- **Doc-vs-code rulings**: none
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Xung đột giữa sự kiện click tương tác canvas 3D và giao diện 2D HTML overlay.

## Open questions

- None

## Corrections

