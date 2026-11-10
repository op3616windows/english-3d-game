---
id: T002
title: Xây dựng StorageService, lưu trữ và khôi phục tiến trình tự động trên LocalStorage
wave: 2
deps:
  - T001
status: done
agent: Antigravity
base: 139f12fcec635edd7c0f9a4fd7dbabf40569b1ee
worktree: null
task_branch: null
files:
  - src/storage.js
  - src/progression.js
  - src/inventory.js
  - src/main.js
---

# T002 — Xây dựng StorageService, lưu trữ và khôi phục tiến trình tự động trên LocalStorage

## Context

Sau khi đã có hệ thống Túi đồ từ vựng và quản lý XP/Level ở T001, task này hiện thực hóa khả năng duy trì dữ liệu dài hạn cho người chơi: Tự động lưu tiến độ vào `localStorage` và khôi phục toàn bộ trạng thái (Level, XP, Túi đồ, Quest, Vị trí) khi người chơi tải lại trang (F5) hoặc quay lại sau đó.

## Approach

- Tạo file `src/storage.js` chứa class `StorageService`:
  - Khóa lưu trữ chuẩn: `wordquest_save_data_v1`.
  - Phương thức `saveState(state)`: Chuyển đổi dữ liệu sang chuỗi JSON và ghi vào `localStorage`.
    - Bảo vệ an toàn chống lỗi (try/catch) cho môi trường Incognito, Private Browsing hoặc khi bộ nhớ đầy (QuotaExceededError) bằng bộ nhớ RAM in-memory dự phòng (đáp ứng E4).
    - Chỉ lưu trữ cấu trúc dữ liệu phẳng tinh gọn (IDs, Level, XP, Badges, Quest states, vị trí x, y, z) không serialize mesh/Three.js objects (đáp ứng N2).
  - Phương thức `loadState()`: Đọc chuỗi JSON từ `localStorage`, parse và xác thực tính hợp lệ (schema validation).
    - Nếu dữ liệu bị hỏng hoặc sai phiên bản, tự động khôi phục về trạng thái mặc định sạch sẽ mà không crash game (đáp ứng N4).
  - Phương thức `clearState()`: Xóa dữ liệu đã lưu để người chơi có thể chơi lại từ đầu.
- Cập nhật `src/progression.js` và `src/inventory.js`:
  - Thêm phương thức `loadFromData(data)` / `serialize()` vào `ProgressionManager` và `InventoryManager` để phục vụ việc nạp/xuất dữ liệu đồng bộ.
- Cập nhật `src/main.js`:
  - Tích hợp `StorageService` vào game loop:
    - Khi khởi động, nạp dữ liệu từ `StorageService.loadState()`.
    - Khôi phục cấp độ, điểm XP, danh sách từ vựng trong túi đồ, danh hiệu và trạng thái các quest đã hoàn thành.
    - Khôi phục vị trí của nhân vật người chơi trong phòng học nếu có dữ liệu lưu trước đó.
    - Tự động lưu trạng thái khi có bất kỳ thay đổi nào (thu thập từ mới, tăng XP, thăng cấp, hoàn thành quest) (đáp ứng SC3, E3).
  - Thêm nút "🔄 Chơi lại từ đầu" trong giao diện để người dùng có thể xóa tiến trình và bắt đầu lại hành trình học nếu muốn.

## Interface contract

- `export class InventoryManager { constructor(container, audioService); addItem(vocab); getItems(); open(); close(); isOpen(); }`
- `export class ProgressionManager { constructor(); addXP(amount); getLevel(); getXP(); getNextLevelXP(); }`

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. AC1: Khi người chơi thu thập từ vựng, nhận điểm XP, thăng cấp hoặc hoàn thành quest, toàn bộ tiến trình được tự động lưu vào LocalStorage; khi tải lại trang (F5) hoặc đóng và mở lại trình duyệt, tất cả dữ liệu (XP, Level, vật phẩm trong túi đồ, trạng thái nhiệm vụ) được khôi phục nguyên vẹn và hiển thị chính xác trên HUD.

## Verify

```bash
test -f src/storage.js && npm install && npm run build
```

Heavy: no

## Log

- 2026-11-10 — created by planner
- 2026-11-11 — implemented StorageService (src/storage.js) with in-memory fallback (E4) and corruption validation (N4)
- 2026-11-11 — integrated auto-saving and state restoration into src/main.js and src/inventory.js
- 2026-11-11 — added reset data button and confirmed build and unit tests pass
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  vite v5.4.21 building for production...
  transforming...
  ✓ 18 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   1.55 kB │ gzip:   0.66 kB
  dist/assets/index-BQM0bm_S.css   19.89 kB │ gzip:   4.09 kB
  dist/assets/index-nqKntf91.js   536.38 kB │ gzip: 137.47 kB
  ✓ built in 1.96s
  npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```
- 2026-11-10 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  vite v5.4.21 building for production...
  transforming...
  ✓ 18 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   1.55 kB │ gzip:   0.66 kB
  dist/assets/index-BQM0bm_S.css   19.89 kB │ gzip:   4.09 kB
  dist/assets/index-nqKntf91.js   536.38 kB │ gzip: 137.47 kB
  ✓ built in 1.97s
  npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   esbuild@0.21.5 (postinstall: node install.js)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```
