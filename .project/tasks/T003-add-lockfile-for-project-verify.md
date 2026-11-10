---
id: T003
title: Bổ sung lockfile package-lock.json để lệnh Project Verify npm ci hoàn thành thành công
wave: 3
deps:
  - T002
status: done
agent: build_T003
base: 56c36d47e80044110b6f774301523456c13afc4c
worktree: null
task_branch: null
files:
  - package-lock.json
---

# T003 — Bổ sung lockfile package-lock.json để lệnh Project Verify npm ci hoàn thành thành công

## Context

Trong quá trình nghiệm thu cuối cùng (Final Review) của Milestone M005, bước kiểm tra tự động Project verify thực thi lệnh:
`npm ci --prefer-offline && npm run build`
Lệnh đã bị chặn và thất bại với lỗi:
`npm error The npm ci command can only install with an existing package-lock.json with lockfileVersion >= 1.`
Nguyên nhân là do file `package-lock.json` chưa được đưa vào quản lý phiên bản trong git. Để lệnh `npm ci` có thể thực thi chính xác và tái lập được trong các môi trường kiểm thử độc lập (sidecar verify) cũng như hệ thống CI/CD, file `package-lock.json` cần được đưa vào kiểm soát phiên bản trong git.

Phát hiện từ Final Review:
- **Source**: `.project/review/final-gap-1.md`
- **Locator**: Risk: project Verify
- **Evidence**: Project Verify failed at the reviewed commit.
- **Fix direction**: Resolve the recorded command failure before shipping.

## Approach

- Bỏ mẫu loại trừ `package-lock.json` trong `.git/info/exclude` để cho phép git theo dõi file này.
- Cập nhật file `package-lock.json` đồng bộ hoàn toàn với `package.json`.
- Đảm bảo `package-lock.json` có định dạng lockfile hợp lệ và chứa đầy đủ cây phụ thuộc (`three`, `vite`).
- Kiểm tra trực tiếp khả năng thực thi của lệnh `npm ci --prefer-offline && npm run build` để chứng minh lỗi được xử lý triệt để.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. File `package-lock.json` được đưa vào theo dõi trong git và phản ánh chính xác các phụ thuộc trong `package.json`.
2. Lệnh `npm ci --prefer-offline && npm run build` chạy thành công mà không gặp lỗi thiếu lockfile, tạo ra bản build trong thư mục `dist/`.

## Verify

```bash
test -f package-lock.json && npm run build
```

Heavy: no

## Log

- 2026-11-11 — created by planner for patch wave 3
- 2026-11-11 — removed package-lock.json exclusion from .git/info/exclude
- 2026-11-11 — generated and synced package-lock.json via npm install --package-lock-only
- 2026-11-11 — verified test -f package-lock.json && npm run build passed with exit 0
- 2026-11-11 — verified npm ci --prefer-offline && npm run build passed with exit 0
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): fail, exit 127; output tail:
  ```
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  sh: 1: vite: not found
  ```
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): fail, exit 1; output tail:
  ```
  vite v5.4.11 building for production...
  transforming...
  ✓ 3 modules transformed.
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  x Build failed in 121ms
  error during build:
  [vite]: Rollup failed to resolve import "three" from "/root/.gsd-path/projects/4dbad9a2c310e1794f8415f7797fdedaffaf74a41ee61c2845bdc50a306d474b/b011c6fdbe484aa66ffc859ac4d3a0bedc01b84a895eb58f4eab1c6904272ac6/verify/task-t003-verify/src/main.js".
  This is most likely unintended because it can break your application at runtime.
  If you do want to externalize this module explicitly add it to
  `build.rollupOptions.external`
      at viteWarn (file:///root/.nvm/versions/node/v26.3.1/lib/node_modules/vite/dist/node/chunks/dep-CB_7IfJ-.js:65589:17)
      at onRollupWarning (file:///root/.nvm/versions/node/v26.3.1/lib/node_modules/vite/dist/node/chunks/dep-CB_7IfJ-.js:65621:5)
      at onwarn (file:///root/.nvm/versions/node/v26.3.1/lib/node_modules/vite/dist/node/chunks/dep-CB_7IfJ-.js:65284:7)
      at file:///root/.nvm/versions/node/v26.3.1/lib/node_modules/vite/node_modules/rollup/dist/es/shared/node-entry.js:22554:13
      at Object.logger [as onLog] (file:///root/.nvm/versions/node/v26.3.1/lib/node_modules/vite/node_modules/rollup/dist/es/shared/node-entry.js:24534:9)
      at ModuleLoader.handleInvalidResolvedId (file:///root/.nvm/versions/node/v26.3.1/lib/node_modules/vite/node_modules/rollup/dist/es/shared/node-entry.js:23279:26)
      at file:///root/.nvm/versions/node/v26.3.1/lib/node_modules/vite/node_modules/rollup/dist/es/shared/node-entry.js:23237:26
  ```
- 2026-11-10 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  vite v5.4.21 building for production...
  transforming...
  ✓ 20 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   1.55 kB │ gzip:   0.65 kB
  dist/assets/index-fwz6uQTp.css   21.45 kB │ gzip:   4.35 kB
  dist/assets/index-DttgRj1D.js   570.31 kB │ gzip: 146.89 kB
  ✓ built in 2.17s
  npm notice run english-3d-game@0.1.0 build
  npm notice run vite build
  
  (!) Some chunks are larger than 500 kB after minification. Consider:
  - Using dynamic import() to code-split the application
  - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
  - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
  ```
