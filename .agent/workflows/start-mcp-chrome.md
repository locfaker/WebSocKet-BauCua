---
description: Khởi động MCP Chrome DevTools server
---

# Workflow: Khởi động MCP Chrome DevTools

Workflow này hướng dẫn cách khởi động và sử dụng MCP Chrome DevTools server.

## Bước 1: Kiểm tra cài đặt

Kiểm tra xem Chrome DevTools MCP đã được cài đặt chưa:

```powershell
npx -y chrome-devtools-mcp@latest --version
```

## Bước 2: Khởi động MCP Server (Tùy chọn)

### Option A: Chế độ thông thường (có UI)
```powershell
npx -y chrome-devtools-mcp@latest
```

### Option B: Chế độ headless (không UI)
```powershell
npx -y chrome-devtools-mcp@latest --headless
```

### Option C: Kết nối với Chrome đang chạy
Trước tiên, khởi động Chrome với remote debugging:
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

Sau đó kết nối MCP:
```powershell
npx -y chrome-devtools-mcp@latest --browserUrl http://127.0.0.1:9222
```

## Bước 3: Sử dụng trong Antigravity

Sau khi MCP server đã được cấu hình (file `.agent/mcp.json`), Antigravity sẽ tự động kết nối khi cần.

Bạn có thể yêu cầu Antigravity thực hiện các tác vụ như:

- "Mở trang http://localhost:5000 và chụp ảnh màn hình"
- "Kiểm tra console errors trên trang game"
- "Test responsive design của game Bau Cua"
- "Phân tích network requests khi load trang"

## Bước 4: Test MCP Server

Để test xem MCP có hoạt động không, yêu cầu Antigravity:

```
"Hãy sử dụng MCP Chrome DevTools để mở trang https://www.google.com và chụp ảnh màn hình"
```

## Ghi chú

- MCP server sẽ tự động khởi động khi Antigravity cần sử dụng
- Không cần chạy thủ công trừ khi bạn muốn debug
- File cấu hình: `.agent/mcp.json`
