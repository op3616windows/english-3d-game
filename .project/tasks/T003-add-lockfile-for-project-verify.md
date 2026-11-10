---
id: T003
title: Bổ sung lockfile package-lock.json để lệnh Project Verify npm ci hoàn thành thành công
wave: 3
deps:
  - T002
status: pending
agent: null
base: null
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
