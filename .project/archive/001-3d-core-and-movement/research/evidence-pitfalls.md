# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Đánh giá độ tương thích của Web Speech API trên các trình duyệt khác nhau và giải pháp fallback khi không có quyền micro.

## Finding: Hạn chế hỗ trợ Web Speech API trên Firefox và iOS Safari

- **Claim**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) hoạt động tốt trên Chrome và Edge (Chromium engine), nhưng trên Firefox mặc định bị tắt (hoặc không hỗ trợ nhận diện giọng nói mà chỉ hỗ trợ SpeechSynthesis), và trên Safari yêu cầu tương tác người dùng chủ động (user gesture) để cấp quyền.
- **Source**: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- **Confidence**: high
- **Why it matters here**: Đảm bảo game không bị crash hoặc chặn tiến độ khi người học sử dụng Firefox hoặc từ chối cấp quyền truy cập microphone.

## Finding: Cơ chế Graceful Fallback dạng Multiple Choice và Text Input

- **Claim**: Khi nhận diện `window.SpeechRecognition` không khả dụng hoặc quyền `navigator.permissions.query({ name: 'microphone' })` bị từ chối/lỗi `not-allowed`, hệ thống fallback tự động chuyển đổi sang giao diện gõ từ (Spelling Input) hoặc chọn phát âm đúng (Multiple Choice) giúp người dùng tiếp tục hoàn thành nhiệm vụ mà không bị gián đoạn.
- **Source**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
- **Confidence**: high
- **Why it matters here**: Thỏa mãn tiêu chí thành công của Charter mà không làm đứt gãy luồng chơi khi thiếu micro.

## Assigned questions — answers

- Đánh giá độ tương thích của Web Speech API trên các trình duyệt khác nhau và giải pháp fallback khi không có quyền micro. → Web Speech API yêu cầu kiểm tra feature detection (`window.SpeechRecognition || window.webkitSpeechRecognition`). Cần xây dựng kiến trúc VoiceController phát hiện tự động: nếu sẵn sàng, bật chế độ nói trực tiếp qua mic; nếu không hỗ trợ hoặc bị từ chối quyền, tự động fallback sang chế độ nhập phím (Spelling Mode) hoặc chọn đáp án (Quiz Mode). Nguồn: MDN Web Docs (https://developer.mozilla.org/).

## Dead ends

- Bắt buộc microphone 100% để tiếp tục cốt truyện — Dẫn đến tỷ lệ drop-off cao từ người dùng không có tai nghe/micro hoặc học ở nơi công cộng.
- Dùng thư viện nhận diện giọng nói WASM quá nặng (Whisper web) ở giai đoạn khởi đầu — Gây giật lag hiệu năng render WebGL 3D khi chạy song song.
