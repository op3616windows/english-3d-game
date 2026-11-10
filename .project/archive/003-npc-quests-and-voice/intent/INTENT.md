# Intent — npc-quests-and-voice

<!-- Written by /gsd-path-define milestone mode. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: web app

## Summary

Bổ sung nhân vật NPC 3D thông minh vào thế giới ảo đóng vai trò người hướng dẫn (Guide/Teacher), cung cấp hệ thống hội thoại phân nhánh (Dialogue box UI), cơ chế giao nhiệm vụ học tập (Quest Engine) tìm kiếm từ vựng và thử thách luyện phát âm bằng giọng nói qua micro (Web Speech API SpeechRecognition) với cơ chế tự động chuyển đổi fallback (gõ chữ/chọn đáp án) khi micro không khả dụng.

## Problem

Người học cần mục tiêu cụ thể, bối cảnh giao tiếp tự nhiên và phản hồi trực tiếp về khả năng phát âm của bản thân thay vì chỉ tự khám phá đồ vật một cách thụ động.

## Users

Người học tiếng Anh muốn trải nghiệm học tập có cốt truyện, nhận nhiệm vụ từ NPC và thử thách phát âm tương tác trực tiếp bằng giọng nói trên trình duyệt.

## Success criteria

1. Người chơi lại gần NPC và bấm phím tương tác để mở hộp thoại giao tiếp bằng tiếng Anh.
2. NPC giao nhiệm vụ tìm kiếm đồ vật và yêu cầu phát âm từ vựng để hoàn thành.
3. Người chơi có thể nói vào micro để hệ thống nhận diện từ phát âm đúng, hoặc chuyển sang chế độ gõ chữ/trắc nghiệm nếu không có micro.
4. Trả quest cho NPC hiển thị thông báo hoàn thành nhiệm vụ kèm hiệu ứng và âm thanh chúc mừng.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | criterion SC1 | Giới hạn khoảng cách tương tác với NPC (chỉ mở hộp thoại khi đứng gần NPC <= 5 units) |
| E2 | SC2 | ordering | criterion SC2 | Trạng thái nhiệm vụ được lưu giữ theo trình tự nhất quán, không nhận trùng lặp khi quest đang thực hiện |
| E3 | SC3 | encoding | criterion SC3 | Tự động chuyển đổi sang giao diện gõ chữ hoặc trắc nghiệm khi trình duyệt không có micro hoặc không hỗ trợ SpeechRecognition |
| E4 | SC4 | idempotency | criterion SC4 | Hoàn thành và nhận thưởng nhiệm vụ chỉ ghi nhận 1 lần duy nhất, không thể spam lặp lại |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | khóa chết điều khiển khi hội thoại NPC | criterion SC1 | Luôn hỗ trợ đóng hộp thoại bằng nút đóng hoặc phím Escape để giải phóng di chuyển |
| N2 | SC2 | reset mất tiến độ quest khi đóng hội thoại | criterion SC2 | Duy trì trạng thái Quest Engine độc lập với trạng thái đóng/mở giao diện |
| N3 | SC3 | treo vô hạn khi chờ nhận diện micro | criterion SC3 | Thiết lập timeout cho SpeechRecognition và hiển thị thông báo rõ ràng cho người dùng |
| N4 | SC4 | cộng dồn vô hạn thưởng khi spam click trả quest | criterion SC4 | Khóa nút nhận thưởng ngay khi kích hoạt sự kiện hoàn tất quest |

## Scope: in

- Mô hình NPC 3D low-poly đứng trong scene với animation vẫy tay chào thân thiện
- Hệ thống Dialogue Box UI hiển thị hội thoại phân nhánh với NPC
- Quest Engine theo dõi vòng đời nhiệm vụ (Available -> Active -> Completed -> Rewarded)
- Tích hợp SpeechRecognition (Web Speech API) nhận diện phát âm tiếng Anh qua microphone
- Cơ chế Fallback tự động (nhập text hoặc trắc nghiệm từ vựng) khi không có micro
- Hiệu ứng âm thanh và huy hiệu chúc mừng hoàn thành quest

## Scope: out (vetoes)

- Bảng xếp hạng trực tuyến và đồng bộ đa người chơi (Charter veto)
- Lưu trữ cơ sở dữ liệu backend phức tạp (giữ state trên client-side/localStorage)
- Nhiều khu vực bản đồ rộng lớn ngoài phòng học chính (thuộc M004)

## Constraints

- Stack: Three.js, Vite, JavaScript ES modules, HTML5/CSS3, Web Speech API (SpeechRecognition, SpeechSynthesis).
- Repository: https://github.com/op3616windows/english-3d-game
- Remote default: main
- GSD Path branch: gsd-path/M003
- Primary worktree: /root/Dev/sandbox/temp/temp4

## Current state (brownfield only)

- **What exists**: Khung cảnh 3D Three.js hoàn chỉnh với sàn, ánh sáng, CharacterController di chuyển WASD góc nhìn thứ 3 (60 FPS), 5 đồ vật học tập 3D tương tác (Table, Book, Apple, Laptop, Chair) với Raycasting/Proximity highlight và Thẻ từ vựng song ngữ 2D modal kèm phát âm SpeechSynthesis chuẩn bản ngữ.
- **Must not break**: Hệ thống điều khiển di chuyển WASD của nhân vật và hệ thống tương tác thẻ từ vựng 3D đã hoàn thành ở M001 và M002.
- **Doc-vs-code rulings**: none
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Một số trình duyệt (Firefox, Safari cũ) có thể không hỗ trợ sẵn `webkitSpeechRecognition`, đòi hỏi cơ chế Fallback gõ chữ/trắc nghiệm phải vận hành trơn tru và tự nhiên.

## Open questions

- None

## Corrections
