V19.3 — ADMIN STANDALONE FIXED

Đã sửa lỗi admin kẹt "Đang tải CRM".
admin.html nay tự chạy độc lập, mở ra phải hiện form đăng nhập ngay.

Tài khoản:
User: thanhbn29
Pass: Thanh2509!

Quan trọng:
- CRM không tự sinh lead.
- Chỉ khi khách gửi form đăng ký thì mới ghi Google Sheet + Gmail.
- CRM chỉ đọc lead thật từ Google Sheet.

Cách cập nhật:
1. Upload toàn bộ gói lên GitHub repo Vaynhanh247vn.
2. Quan trọng nhất: đảm bảo file admin.html ở root được ghi đè.
3. Cập nhật Apps Script bằng google-apps-script/Code.gs.
4. Deploy Apps Script phiên bản mới.
5. Test bằng link:
https://thanhbn2910.github.io/Vaynhanh247vn/admin.html?v=193

Nếu vẫn thấy "Đang tải CRM", nghĩa là GitHub vẫn đang dùng file admin.html cũ hoặc cache trình duyệt.
Hãy mở bằng ?v=193 và Ctrl+F5.
