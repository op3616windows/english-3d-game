# Intent — gamification-and-progression

<!-- Written by /gsd-path-define milestone mode. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: web app

## Summary

Hiện thực hóa hệ thống gamification và lưu trữ tiến độ học tập toàn diện cho người chơi: Túi đồ từ vựng (Inventory UI) lưu giữ các đồ vật và thẻ từ vựng đã khám phá, hệ thống tính điểm kinh nghiệm (XP), thanh tiến trình và thăng cấp người học (Level Progression), cùng module lưu trữ LocalStorage tự động đồng bộ hóa trạng thái giúp người chơi tiếp tục hành trình học tiếng Anh ngay cả sau khi tải lại trang web hoặc đóng trình duyệt.

## Problem

Người học cần cảm giác thành tựu rõ rệt (progression & rewards), khả năng tích lũy vốn từ (collection/inventory) để ôn tập bất kỳ lúc nào, và tính bền vững của dữ liệu học tập mà không bị mất tiến trình mỗi khi tải lại trang.

## Users

Người học tiếng Anh muốn trải nghiệm trò chơi học tập 3D có hệ thống cấp độ (Level 1, Level 2...), thanh kinh nghiệm rõ ràng, túi đồ sưu tập từ vựng tiện lợi và tiến trình được lưu tự động trên trình duyệt.

## Success criteria

1. Vật phẩm sau khi hoàn thành tương tác có thể cất vào túi đồ và mở ra xem lại danh sách từ vựng bất kỳ lúc nào.
2. Mỗi từ vựng học xong hoặc quest hoàn thành cộng XP và tăng cấp độ hiển thị trên HUD.
3. Tải lại trang web (F5), tiến độ học tập (XP, cấp độ, túi đồ) vẫn được giữ nguyên đầy đủ.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | criterion SC1 | Túi đồ khi chưa thu thập vật phẩm nào hiển thị trạng thái trống (empty state) với thông điệp gợi ý người chơi đi tìm đồ vật |
| E2 | SC2 | boundary | criterion SC2 | Khi người chơi đạt đủ điểm kinh nghiệm (XP) qua ngưỡng thăng cấp, hệ thống tự động tăng cấp độ (Level Up) kèm hiệu ứng thông báo và cập nhật thanh tiến trình XP |
| E3 | SC3 | idempotency | criterion SC3 | Tải lại trang web (F5) hoặc mở lại trình duyệt, StorageService đọc từ LocalStorage và khôi phục nguyên vẹn trạng thái XP, cấp độ, túi đồ và quest đã hoàn tất |
| E4 | SC3 | boundary | criterion SC3 | Khi LocalStorage bị chặn hoặc đạt giới hạn lưu trữ (chế độ ẩn danh / quota exceeded), hệ thống xử lý ngoại lệ an toàn và fallback vào bộ nhớ RAM mà không crash game |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | khóa chết giao diện khi mở túi đồ | criterion SC1 | Luôn hỗ trợ đóng túi đồ bằng nút đóng, phím Escape hoặc phím tắt 'I' để giải phóng điều khiển người chơi |
| N2 | SC3 | lưu dữ liệu 3D cồng kềnh vào LocalStorage | criterion SC3 | Chỉ lưu trữ schema JSON tinh gọn (ID vật phẩm, EXP, Level, Badges, vị trí nhân vật) |
| N3 | SC2 | reset tiến trình XP khi học lại từ vựng cũ | criterion SC2 | Đảm bảo tính nhất quán của dữ liệu kinh nghiệm và ngăn ngừa lỗi âm điểm |
| N4 | SC3 | crash game khi dữ liệu LocalStorage bị sai định dạng | criterion SC3 | Kiểm tra tính hợp lệ (schema validation) trước khi nạp dữ liệu, fallback về mặc định nếu dữ liệu hỏng |

## Scope: in

- Túi đồ học tập (Inventory Modal UI) hiển thị lưới các vật phẩm từ vựng đã thu thập, có nút phát âm và xem lại nghĩa chi tiết
- Phím tắt mở/đóng túi đồ (phím `I` hoặc click biểu tượng ba lô / túi đồ trên HUD)
- Hệ thống tính điểm kinh nghiệm (XP), công thức thăng cấp (Level 1, Level 2...), và thanh tiến trình XP trên HUD
- Hiệu ứng thông báo chúc mừng thăng cấp (Level Up Notification)
- Module `StorageService` tự động lưu và khôi phục tiến trình (Inventory, XP, Level, Badges, Quest state, Player position) qua `localStorage`
- Nút Reset dữ liệu tiến trình (Clear data) trong cài đặt / HUD để người chơi có thể chơi lại từ đầu nếu muốn

## Scope: out (vetoes)

- Đấu trường thi đấu trực tuyến nhiều người chơi (Charter veto)
- Đồng bộ dữ liệu lên máy chủ đám mây / Cloud database (giữ hoàn toàn trên client-side/localStorage theo Charter constraints)
- Mở rộng nhiều bản đồ khác ngoài phòng học 3D (thuộc các phiên bản sau)

## Constraints

- Stack: Three.js, Vite, JavaScript ES modules, HTML5/CSS3, Web Speech API, Web Audio API, LocalStorage.
- Repository: https://github.com/op3616windows/english-3d-game
- Remote default: main
- GSD Path branch: gsd-path/M004
- Primary worktree: /root/Dev/sandbox/temp/temp4

## Current state (brownfield only)

- **What exists**: Khung cảnh 3D phòng học Three.js hoàn chỉnh (60 FPS), CharacterController di chuyển WASD góc nhìn thứ 3, 5 đồ vật học tập 3D tương tác (Table, Book, Apple, Laptop, Chair) với Thẻ từ vựng song ngữ 2D modal kèm phát âm SpeechSynthesis chuẩn bản ngữ, NPC 3D Teacher Alex với animation vẫy tay và hộp thoại Dialogue phân nhánh, QuestEngine quản lý nhiệm vụ, VoiceService nhận diện giọng nói qua microphone và fallback nhập phím/trắc nghiệm, âm thanh fanfare chúc mừng.
- **Must not break**: Hệ thống điều khiển di chuyển WASD, tương tác đồ vật 3D, hộp thoại NPC Teacher Alex, Quest Engine và Voice Challenge đã hoàn thành ở M001, M002, M003.
- **Doc-vs-code rulings**: none
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Trình duyệt chạy ở chế độ riêng tư (Incognito mode) hoặc bộ nhớ trình duyệt bị xóa có thể làm mất dữ liệu LocalStorage; cần thông báo nhẹ nhàng cho người dùng và fallback an toàn in-memory.

## Open questions

- None

## Corrections
