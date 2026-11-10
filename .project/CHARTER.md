# Charter — English 3D Game (WordQuest)

<!-- Written by /gsd-path-define program mode. Enduring program intent:
     vetoes and constraints here override every milestone. Amended only by an
     explicit user ruling recorded under Corrections. Lives at .project/
     top level and persists across milestones; it never archives. -->

Review panel: off

## Vision

Xây dựng website học tiếng Anh tương tác 3D trên trình duyệt sử dụng Three.js theo phương pháp Contextual Immersion (Đắm chìm theo ngữ cảnh). Người học tự do điều khiển nhân vật khám phá không gian 3D, tiếp cận đồ vật để xem và nghe từ vựng chuẩn bản ngữ, đồng thời giao tiếp với NPC và giải quyết các nhiệm vụ thực tế để ghi nhớ từ vựng lâu dài và tự nhiên.

## Full scope: in

- 3D World & Character: Three.js renderer tối ưu trên nền Vite, điều khiển nhân vật góc nhìn thứ 3 (WASD/phím mũi tên), camera bám theo (follow/orbit camera), hoạt ảnh nhân vật (idle/walk/run).
- Vocabulary & Object Interaction: Raycasting hover và click vào các đồ vật 3D, hiển thị Card từ vựng chi tiết (từ, phiên âm IPA, nghĩa tiếng Việt, câu ví dụ), phát âm audio chuẩn.
- Audio & Speech Recognition: Tích hợp Web Audio API / HTML5 Audio phát âm từ vựng chuẩn và Web Speech API (SpeechRecognition) để người học luyện nói/kiểm tra phát âm.
- Quests & NPC Dialogue: Hệ thống hội thoại phân nhánh với nhân vật NPC, hệ thống nhiệm vụ học tập (tìm đồ vật, trả lời trắc nghiệm, giải đố), túi đồ (Inventory) chứa vật phẩm nhặt được.
- Gamification & UI Overlay: Giao diện 2D overlay hiện đại (HUD, Quest Log, hệ thống điểm thưởng XP, level, cài đặt âm thanh) lưu trạng thái qua LocalStorage.

## Full scope: out (vetoes)

- Multiplayer thời gian thực — Tập trung 100% vào trải nghiệm Single-player mượt mà, tránh độ phức tạp về server WebSocket/networking.
- Đồ họa AAA / model dung lượng lớn — Tránh texture 4K hoặc model quá nặng; ưu tiên phong cách Low-poly tối ưu tải trang dưới 15MB.
- Backend phức tạp / Microservices — Không triển khai kiến trúc backend phân tán phức tạp ở giai đoạn đầu; ưu tiên chạy trực tiếp trên client web và lưu trữ LocalStorage/IndexedDB.

## Constraints

- Stack: Three.js, Vite, TypeScript/JavaScript, HTML5/CSS3 hoặc TailwindCSS cho 2D UI overlay.
- Web APIs: Web Audio API, Web Speech API (SpeechSynthesis & SpeechRecognition).
- Target Browser: Hỗ trợ các trình duyệt hiện đại (Chrome, Edge, Firefox, Safari) đạt tốc độ 60 FPS trên máy tính thông thường.
- Repository: https://github.com/op3616windows/english-3d-game
- Remote default: main
- Remote default SHA: 48c106abd1cda828e384b2728f3aa9fba2bc43bc
- GSD Path branch: gsd-path/M001
- Primary worktree: /root/Dev/sandbox/temp/temp4

## Program success criteria

1. Người dùng truy cập website tải xong scene 3D trong dưới 5 giây trên đường truyền thông thường.
2. Điều khiển nhân vật mượt mà góc nhìn thứ 3, tương tác được với ít nhất 20+ đồ vật 3D trong scene để xem thẻ từ vựng và nghe audio phát âm.
3. Hoàn thành ít nhất một chuỗi nhiệm vụ hoàn chỉnh với NPC (nhận nhiệm vụ -> tìm và nhặt vật phẩm vào túi đồ -> quay lại trả quest -> nhận điểm thưởng XP).
4. Tính năng luyện phát âm qua Micro nhận diện giọng nói và chấm điểm phát âm từ vựng của người học.

## Open questions

- [RESEARCH] Lựa chọn library 3D asset loader và quản lý hoạt ảnh (GLTFLoader + AnimationMixer) cùng cấu trúc scene low-poly tối ưu nhất.
- [RESEARCH] Đánh giá độ tương thích của Web Speech API trên các trình duyệt khác nhau và giải pháp fallback khi không có quyền micro.

## Corrections

