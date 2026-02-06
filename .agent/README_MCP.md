# Hướng dẫn sử dụng MCP Chrome DevTools trong Antigravity

## Giới thiệu
MCP Chrome DevTools đã được cấu hình cho dự án Bau Cua. Server này cho phép Antigravity tương tác với Chrome browser và Chrome DevTools.

## Cấu hình

File cấu hình MCP đã được tạo tại: `.agent/mcp.json`

### Cấu trúc cấu hình:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"],
      "description": "Chrome DevTools MCP Server",
      "env": {}
    }
  }
}
```

## Tính năng chính

MCP Chrome DevTools cung cấp các khả năng sau:

### 1. **Browser Control** (Điều khiển trình duyệt)
- Mở/đóng tabs
- Điều hướng đến URL
- Chụp ảnh màn hình
- Thực thi JavaScript

### 2. **DevTools Integration** (Tích hợp DevTools)
- Inspect elements
- Debug JavaScript
- Monitor network requests
- Analyze performance

### 3. **Automation** (Tự động hóa)
- Tự động test UI
- Scraping dữ liệu
- Kiểm tra responsive design

## Cách sử dụng trong Antigravity

Sau khi cấu hình, bạn có thể yêu cầu Antigravity:

### Ví dụ 1: Mở trang web và chụp ảnh
```
"Hãy mở trang http://localhost:5000 và chụp ảnh màn hình"
```

### Ví dụ 2: Test responsive design
```
"Kiểm tra giao diện game Bau Cua trên các kích thước màn hình khác nhau"
```

### Ví dụ 3: Debug JavaScript
```
"Kiểm tra console errors khi chơi game Bau Cua"
```

### Ví dụ 4: Analyze performance
```
"Phân tích hiệu suất tải trang của game Bau Cua"
```

## Các tùy chọn nâng cao

### Chạy ở chế độ headless:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--headless"],
      "description": "Chrome DevTools MCP Server (Headless)",
      "env": {}
    }
  }
}
```

### Sử dụng Chrome Canary:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--channel", "canary"],
      "description": "Chrome DevTools MCP Server (Canary)",
      "env": {}
    }
  }
}
```

### Kết nối với Chrome đang chạy:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--browserUrl", "http://127.0.0.1:9222"],
      "description": "Chrome DevTools MCP Server (Connect to running Chrome)",
      "env": {}
    }
  }
}
```

## Khởi động Chrome với remote debugging

Nếu muốn kết nối với Chrome đang chạy, khởi động Chrome với lệnh:

### Windows:
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

### Hoặc tạo shortcut với flag:
```
--remote-debugging-port=9222
```

## Troubleshooting

### Lỗi: Chrome không tìm thấy
- Đảm bảo Chrome đã được cài đặt
- Thử chỉ định đường dẫn Chrome: `--executablePath "C:\Program Files\Google\Chrome\Application\chrome.exe"`

### Lỗi: Port đã được sử dụng
- Đóng các instance Chrome khác
- Hoặc sử dụng port khác: `--browserUrl http://127.0.0.1:9223`

### Lỗi: Node.js version
- Cần Node.js v22+
- Kiểm tra: `node --version`

## Tài liệu tham khảo

- GitHub: https://github.com/ChromeDevTools/chrome-devtools-mcp
- MCP Servers: https://mcpservers.org
- Chrome DevTools Protocol: https://chromedevtools.github.io/devtools-protocol/

## Ghi chú bảo mật

⚠️ **Lưu ý**: MCP Chrome DevTools có thể truy cập nội dung browser. Tránh chia sẻ thông tin nhạy cảm khi sử dụng.
