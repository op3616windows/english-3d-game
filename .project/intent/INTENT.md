# Intent — 3d-core-and-movement

<!-- Written by /gsd-path-define milestone mode. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: web app

## Summary

Khởi tạo dự án Three.js với Vite, dựng không gian 3D cơ bản và bộ điều khiển nhân vật góc nhìn thứ 3 với camera follow mượt mà. Người dùng mở trang web là có thể điều khiển nhân vật di chuyển tự do bằng phím WASD, góc nhìn camera mượt mà và hoạt ảnh idle/walk chuyển đổi tự nhiên.

## Problem

Người học tiếng Anh cần một môi trường học tập tương tác trực quan 3D nhưng hiện tại dự án chưa có nền tảng scene, bộ điều khiển nhân vật và camera 3D chuẩn xác.

## Users

Người học tiếng Anh mọi lứa tuổi muốn tiếp cận phương pháp học đắm chìm trực quan qua game 3D trên trình duyệt web.

## Success criteria

1. Ứng dụng web tải xong trong trình duyệt dưới 3 giây và duy trì tốc độ 60 FPS trên màn hình tiêu chuẩn.
2. Người dùng có thể nhấn các phím W, A, S, D hoặc phím mũi tên để điều khiển nhân vật xoay và di chuyển trên mặt sàn 3D, camera bám theo mượt mà.
3. Hoạt ảnh nhân vật chuyển đổi mượt mà giữa trạng thái đứng yên (idle) và bước đi (walk) khi người chơi bắt đầu hoặc ngừng di chuyển.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | boundary | criterion SC1 | Khởi tạo Scene, Camera và Renderer gọn nhẹ đảm bảo tốc độ tải trang dưới 3 giây |
| E2 | SC2 | ordering | criterion SC2 | Nhấn đồng thời nhiều phím di chuyển (ví dụ W + D) điều khiển nhân vật di chuyển chéo góc 45 độ chuẩn xác |
| E3 | SC3 | adjacency | criterion SC3 | Chuyển đổi trạng thái hoạt ảnh giữa idle và walk mượt mà không bị khựng hình |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | rò rỉ bộ nhớ WebGL hoặc tụt khung hình dưới 30 FPS | criterion SC1 | Kiểm soát animation loop và hủy tài nguyên hợp lý khi unmount |
| N2 | SC2 | kẹt phím điều khiển hoặc nhân vật rơi khỏi mặt sàn | criterion SC2 | Ràng buộc tọa độ di chuyển nhân vật trong phạm vi sàn đấu |
| N3 | SC3 | giật lag hoặc méo mó chuyển động nhân vật | criterion SC3 | AnimationMixer xử lý cross-fade chuyển động mượt mà |

## Scope: in

- Cấu trúc dự án Vite + Three.js theo dạng module hóa
- Khung cảnh 3D (Scene, Perspective Camera, Ambient/Directional Lights, mặt sàn và lưới tọa độ)
- Nhân vật 3D Low-poly với bộ điều khiển di chuyển WASD/phím mũi tên
- Camera góc nhìn thứ 3 tự động bám theo nhân vật
- Hệ thống AnimationMixer chuyển đổi hoạt ảnh đứng yên (idle) và di chuyển (walk)

## Scope: out (vetoes)

- Hệ thống tương tác từ vựng và thẻ học (thuộc M002)
- NPC, hội thoại và nhận diện giọng nói (thuộc M003)
- Túi đồ, cấp độ và lưu trữ tiến độ (thuộc M004)
- Multiplayer thời gian thực (Charter veto)

## Constraints

- Stack: Three.js, Vite, JavaScript ES modules, HTML5/CSS3.
- Target Browser: Hỗ trợ các trình duyệt hiện đại (Chrome, Edge, Firefox, Safari) đạt tốc độ 60 FPS.
- Repository: https://github.com/op3616windows/english-3d-game
- Remote default: main
- Remote default SHA: 48c106abd1cda828e384b2728f3aa9fba2bc43bc
- GSD Path branch: gsd-path/M001
- Primary worktree: /root/Dev/sandbox/temp/temp4

## Risks

- Tụt FPS hoặc lag camera khi render vòng lặp RequestAnimationFrame trên các thiết bị cấu hình thấp.

## Open questions

- None

## Corrections

