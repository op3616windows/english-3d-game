# Roadmap — English 3D Game (WordQuest)

<!-- Written and owned by /gsd-path-roadmap. Rolling-wave: milestone-granularity
     scope for EVERY milestone; waves and tasks are planned only for the active
     milestone. Never edit a shipped entry except its Status, Archive, and
     Integrated fields; never edit an abandoned entry at all. Lives at
     .project/ top
     level and persists across milestones; it never archives. -->

## Milestones

### M001 — 3d-core-and-movement

Goal: Khởi tạo dự án Three.js với Vite, dựng không gian 3D cơ bản và bộ điều khiển nhân vật góc nhìn thứ 3 với camera follow mượt mà.
Depends on: []
Surfaces: web app
Status: active
Archive: null
Integrated: null

Scope: in
- Cấu trúc dự án Vite + Three.js theo dạng module hóa
- Khung cảnh 3D (Scene, Perspective Camera, Ambient/Directional Lights, mặt sàn và lưới tọa độ)
- Nhân vật 3D Low-poly với bộ điều khiển di chuyển WASD/phím mũi tên
- Camera góc nhìn thứ 3 tự động bám theo nhân vật
- Hệ thống AnimationMixer chuyển đổi hoạt ảnh đứng yên (idle) và di chuyển (walk)

Scope: out
- Hệ thống tương tác từ vựng và thẻ học (thuộc M002)
- NPC, hội thoại và nhận diện giọng nói (thuộc M003)
- Túi đồ, cấp độ và lưu trữ tiến độ (thuộc M004)

Success criteria
1. Ứng dụng web tải xong trong trình duyệt dưới 3 giây và duy trì tốc độ 60 FPS trên màn hình tiêu chuẩn.
2. Người dùng có thể nhấn các phím W, A, S, D hoặc phím mũi tên để điều khiển nhân vật xoay và di chuyển trên mặt sàn 3D, camera bám theo mượt mà.
3. Hoạt ảnh nhân vật chuyển đổi mượt mà giữa trạng thái đứng yên (idle) và bước đi (walk) khi người chơi bắt đầu hoặc ngừng di chuyển.

Risks
- Tụt FPS hoặc lag camera khi render vòng lặp RequestAnimationFrame trên các thiết bị cấu hình thấp.

Open questions
- None

### M002 — vocabulary-interaction

Goal: Xây dựng hệ thống raycasting tương tác đồ vật 3D trong scene và hiển thị thẻ từ vựng 2D overlay kèm phát âm audio chuẩn.
Depends on: [M001]
Surfaces: web app
Status: pending
Archive: null
Integrated: null

Scope: in
- Bố trí các đồ vật nội thất 3D (bàn, ghế, quả táo, cuốn sách, máy tính...) với collider/bounding box
- Hệ thống Raycaster hover/click phát hiện vật thể đang được trỏ chuột hoặc khi nhân vật đứng gần
- Hiệu ứng highlight/outline khi trỏ vào đồ vật
- 2D UI Overlay Card từ vựng (tên tiếng Anh, phiên âm IPA, nghĩa tiếng Việt, câu ví dụ thực tế)
- Tích hợp Web Speech API SpeechSynthesis hoặc Audio player phát âm chuẩn bản ngữ khi click biểu tượng loa

Scope: out
- Nhận diện giọng nói qua microphone (thuộc M003)
- Chuỗi nhiệm vụ giao tiếp NPC (thuộc M003)
- Túi đồ và thanh tiến độ XP (thuộc M004)

Success criteria
1. Khi rê chuột hoặc đưa nhân vật lại gần đồ vật 3D, đồ vật đổi màu viền/phát sáng và hiển thị nhãn tên vật thể trên màn hình.
2. Nhấp chuột vào đồ vật mở ra Thẻ từ vựng 2D chi tiết hiển thị đầy đủ phiên âm IPA và nghĩa tiếng Việt.
3. Nhấn nút phát âm trên thẻ từ vựng nghe được âm thanh phát âm tiếng Anh chuẩn rõ ràng.

Risks
- Xung đột giữa sự kiện click tương tác canvas 3D và giao diện 2D HTML overlay.

Open questions
- None

### M003 — npc-quests-and-voice

Goal: Thêm nhân vật NPC giao nhiệm vụ học tập, hộp thoại hội thoại phân nhánh và luyện phát âm bằng giọng nói qua micro với cơ chế fallback.
Depends on: [M002]
Surfaces: web app
Status: pending
Archive: null
Integrated: null

Scope: in
- Mô hình NPC 3D đứng trong phòng/thị trấn với hoạt ảnh vẫy tay chào
- Hệ thống hộp thoại hội thoại tương tác (Dialogue box UI) với câu hỏi tiếng Anh
- Hệ thống Quest Engine (theo dõi trạng thái nhận quest, điều kiện hoàn thành, trả thưởng)
- Tích hợp Web Speech API SpeechRecognition nhận diện giọng nói khi trả lời thử thách phát âm
- Cơ chế Fallback tự động sang dạng gõ từ hoặc chọn đáp án khi micro không khả dụng

Scope: out
- Bảng xếp hạng và nhiều phòng thế giới mở rộng (thuộc M004)

Success criteria
1. Người chơi lại gần NPC và bấm phím tương tác để mở hộp thoại giao tiếp bằng tiếng Anh.
2. NPC giao nhiệm vụ tìm kiếm đồ vật và yêu cầu phát âm từ vựng để hoàn thành.
3. Người chơi có thể nói vào micro để hệ thống nhận diện từ phát âm đúng, hoặc chuyển sang chế độ gõ chữ/trắc nghiệm nếu không có micro.
4. Trả quest cho NPC hiển thị thông báo hoàn thành nhiệm vụ kèm âm thanh chúc mừng.

Risks
- Trình duyệt từ chối quyền microphone hoặc nhiễu âm thanh môi trường xung quanh làm giảm độ chính xác nhận diện giọng nói.

Open questions
- None

### M004 — gamification-and-progression

Goal: Bổ sung túi đồ (Inventory), hệ thống điểm kinh nghiệm XP, cấp độ, lưu trữ tiến độ trên LocalStorage và hoàn thiện thẩm mỹ giao diện HUD.
Depends on: [M003]
Surfaces: web app
Status: pending
Archive: null
Integrated: null

Scope: in
- Túi đồ (Inventory UI) hiển thị các vật phẩm từ vựng đã thu thập được trong không gian 3D
- Hệ thống tính điểm kinh nghiệm (XP), cấp độ người học (Level) và danh hiệu học tập
- HUD hiển thị thanh năng lượng học tập, số từ vựng đã thuộc và quest tracker bên góc màn hình
- Module Storage tự động lưu tiến trình học tập, vị trí nhân vật và điểm số vào LocalStorage để tiếp tục khi vào lại web
- Tối ưu hóa hiệu năng, responsive trên các tỷ lệ màn hình và âm thanh nền (BGM/SFX)

Scope: out
- Đấu trường thi đấu trực tuyến nhiều người chơi (Veto theo Charter)

Success criteria
1. Vật phẩm sau khi hoàn thành tương tác có thể cất vào túi đồ và mở ra xem lại danh sách từ vựng bất kỳ lúc nào.
2. Mỗi từ vựng học xong hoặc quest hoàn thành cộng XP và tăng cấp độ hiển thị trên HUD.
3. Tải lại trang web (F5), tiến độ học tập (XP, cấp độ, túi đồ) vẫn được giữ nguyên đầy đủ.

Risks
- Tràn dữ liệu dung lượng LocalStorage nếu lưu trữ trạng thái quá phức tạp.

Open questions
- None
