# Intent — English 3D Game (WordQuest) - M005

<!-- Written by /gsd-path-define milestone mode. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: web app

## Summary

Mở rộng không gian học tập từ một phòng học đơn lẻ sang hệ thống đa phòng (Study Room, Living Room, Kitchen & Cafe) kết nối bằng các cửa/cổng dịch chuyển mượt mà. Bổ sung các đồ vật 3D tương tác mới theo chủ đề ẩm thực và gia đình, kèm giao diện Minimap và chỉ báo khu vực trên HUD, đồng thời tối ưu hóa giải phóng tài nguyên Three.js duy trì 60 FPS ổn định.

## Problem

Hiện tại trò chơi chỉ diễn ra trong một căn phòng học đơn lẻ (Study Room) với số lượng từ vựng cố định, người chơi chưa có trải nghiệm khám phá các không gian thực tế khác như phòng khách, phòng bếp để học từ vựng theo ngữ cảnh đa dạng và sinh động.

## Users

Người học tiếng Anh ở mọi lứa tuổi, yêu thích phương pháp đắm chìm trong không gian 3D tương tác và muốn mở rộng vốn từ vựng theo nhiều chủ đề đời sống hàng ngày.

## Success criteria

1. Người chơi có thể di chuyển nhân vật đến cửa/cổng dịch chuyển để chuyển sang phân cảnh mới (ví dụ: từ Study Room sang Kitchen hoặc Living Room) trong dưới 1 giây.
2. Mỗi phân cảnh mới có các đồ vật 3D tương tác mới theo đúng chủ đề, hiển thị thẻ từ vựng và âm thanh phát âm tương ứng.
3. Bản đồ thu nhỏ (Minimap) hoặc thông báo khu vực trên HUD hiển thị chính xác tên phòng hiện tại và vị trí người chơi.
4. Quá trình chuyển phòng giải phóng tài nguyên Three.js cũ, duy trì 60 FPS ổn định không bị rò rỉ bộ nhớ.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | Nhân vật đứng sát mép cửa hoặc chạm portal kích hoạt chuyển phòng an toàn có debounce 1.5s ngăn lặp kép |
| E2 | SC2 | empty | criterion SC2 | Mỗi phân cảnh mới được cấu hình sẵn ít nhất 15 đồ vật từ vựng theo chủ đề phòng |
| E3 | SC3 | precision | criterion SC3 | Tọa độ nhân vật trên Minimap được chuẩn hóa tỉ lệ theo kích thước của từng phòng |
| E4 | SC4 | idempotency | criterion SC4 | Chuyển đổi qua lại liên tục giữa các phòng giải phóng triệt để geometry/texture, không suy giảm FPS |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | reset hoặc làm mất tiến trình người chơi | criterion SC1 | Không được xóa hay reset tiến trình XP, Level, túi đồ và quest khi chuyển phòng |
| N2 | SC2 | từ vựng thiếu phát âm hoặc sai bản dịch | criterion SC2 | Tất cả từ vựng mới phải có phiên âm IPA, nghĩa tiếng Việt chuẩn và audio phát âm |
| N3 | SC3 | UI Minimap che khuất tầm nhìn người chơi | criterion SC3 | Minimap đặt gọn ở góc màn hình, kích thước vừa phải và có độ trong suốt tinh tế |
| N4 | SC4 | rò rỉ bộ nhớ Three.js / WebGL khi đổi phòng | criterion SC4 | Dọn dẹp sạch sẽ mesh, geometry và material của phòng cũ khi chuyển sang phòng mới |

## Scope: in

- Thiết kế hệ thống Scene Switcher / Zone Manager quản lý nhiều không gian 3D (Study Room, Living Room, Kitchen & Cafe)
- Cổng dịch chuyển / Cửa ra vào (Doors / Portals) cho phép nhân vật bước qua để chuyển cảnh mượt mà
- Bổ sung các đồ vật 3D tương tác mới theo chủ đề phòng khách, ẩm thực, gia đình
- Tích hợp Minimap / HUD Zone Indicator hiển thị tên khu vực hiện tại và bản đồ mini thu nhỏ
- Tối ưu hiệu năng bộ nhớ và dọn dẹp tài nguyên (dispose mesh/textures) khi chuyển đổi giữa các phòng

## Scope: out (vetoes)

- Hệ thống ôn tập ngắt quãng Spaced Repetition (SRS) (thuộc M006)
- Tích hợp AI đàm thoại tự do với NPC qua LLM (thuộc M007)
- Chế độ nhiều người chơi trực tuyến (Multiplayer) theo Charter

## Constraints

- Stack: Three.js v0.170.0, Vite v5.4.11, JavaScript ES Modules, HTML5/CSS3.
- Performance: Đạt 60 FPS trên máy tính thông thường, chuyển phòng trong dưới 1 giây.
- Asset style: Low-poly procedural geometries / lightweight 3D primitives tối ưu dưới 15MB tổng kích thước.
- Web APIs: Web Audio API, Web Speech API, LocalStorage persistence.

## Current state (brownfield only)

- **What exists**: Game 3D học tiếng Anh hoàn chỉnh với điều khiển nhân vật góc nhìn thứ 3, tương tác từ vựng raycasting, NPC hội thoại & nhiệm vụ có nhận diện giọng nói, túi đồ và lưu trữ LocalStorage.
- **Must not break**: Hệ thống điều khiển phím WASD, âm thanh phát âm từ vựng, túi đồ và tiến trình XP/Level đã lưu trữ.
- **Doc-vs-code rulings**: Không có xung đột tài liệu và code (README.md là descriptive doc).
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Quá tải bộ nhớ WebGL/RAM nếu không giải phóng texture và geometry của phòng cũ trước khi nạp phòng mới.

## Open questions

- None

## Corrections
