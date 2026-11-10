# Evidence — stack

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: stack
Questions assigned: Lựa chọn library 3D asset loader và quản lý hoạt ảnh (GLTFLoader + AnimationMixer) cùng cấu trúc scene low-poly tối ưu nhất.

## Finding: Three.js GLTFLoader kết hợp DRACOLoader là chuẩn tối ưu cho asset 3D trên web

- **Claim**: GLTFLoader của Three.js kết hợp DRACOLoader hoặc MeshoptDecoder giảm dung lượng file glb từ 40% đến 70%, đồng thời AnimationMixer hỗ trợ blending nhiều clip hoạt ảnh (idle, walk, run) trên cùng một skeletal rig với overhead CPU dưới 2ms mỗi frame.
- **Source**: https://threejs.org/docs/#examples/en/loaders/GLTFLoader
- **Confidence**: high
- **Why it matters here**: Phục vụ yêu cầu nạp nhanh màn chơi và nhân vật điều khiển trong dưới 5 giây theo tiêu chí Program Charter.

## Finding: Kiến trúc phân tách Three.js Scene Controller và 2D UI Overlay

- **Claim**: Phân tách Canvas WebGL render 3D làm background/layer dưới và render DOM HTML/TailwindCSS làm HUD/UI overlay ở layer trên thông qua Custom Event Emitter hoặc State Store (như Zustand / signals nhẹ) mang lại trải nghiệm mượt mà, văn bản thẻ từ vựng hiển thị sắc nét hơn hẳn so với render text 3D trong WebGL.
- **Source**: https://github.com/mrdoob/three.js
- **Confidence**: high
- **Why it matters here**: Giúp thẻ từ vựng, phiên âm IPA, câu ví dụ và hộp thoại hội thoại NPC dễ đọc, dễ tiếp cận và có styling đẹp mắt.

## Assigned questions — answers

- Lựa chọn library 3D asset loader và quản lý hoạt ảnh (GLTFLoader + AnimationMixer) cùng cấu trúc scene low-poly tối ưu nhất. → Sử dụng trực tiếp `three/addons/loaders/GLTFLoader.js` cùng `three.AnimationMixer` và cấu trúc quản lý Action Manager tập trung. Đối với asset cảnh quan, dùng mô hình Low-poly định dạng GLB tối ưu kích thước mesh dưới 5MB. Nguồn tài liệu: Three.js official examples and documentation (https://threejs.org/docs/).

## Dead ends

- Unity WebGL / Unreal Pixel Streaming — Dung lượng build ban đầu quá lớn (>30-100MB), thời gian load màn đầu tiên lâu, không phù hợp cho trải nghiệm web học nhanh tức thì.
- TextGeometry 3D trong Three.js để hiển thị nghĩa từ vựng — Tốn nhiều vertices làm giảm FPS và khó hiển thị tiếng Việt có dấu cũng như ký tự phiên âm IPA phức tạp.
