V15.3 UI Pro - Tài Chính 247

Cài đặt GitHub Pages:
1. Giải nén zip.
2. Upload toàn bộ file/folder bên trong lên repo taichinh247vn.
3. Commit changes.
4. Chờ 1-2 phút.
5. Mở: https://thanhbn2910.github.io/taichinh247vn/?v=153

Cài Google Sheet CRM thật:
1. Tạo Google Sheet mới.
2. Extensions > Apps Script.
3. Copy google-apps-script/Code.gs vào Apps Script.
4. Deploy > New deployment > Web app.
5. Execute as Me, Who has access Anyone.
6. Copy Web App URL.
7. Mở assets/app.js, sửa GAS_URL:'' thành GAS_URL:'LINK_WEB_APP'.
8. Upload lại assets/app.js lên GitHub và Commit.

Kiểm tra:
- Trang chủ: /?v=153
- Admin: /admin.html
- CSS: /assets/style.css
- JS: /assets/app.js
