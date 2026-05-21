TÀI CHÍNH 247 VN - V15.2 MONETIZE AFFILIATE COMPLETE

1) Upload lên GitHub Pages
- Giải nén file ZIP.
- Vào repo: Thanhbn2910/taichinh247vn
- Code -> Add file -> Upload files.
- Kéo TOÀN BỘ file/folder bên trong thư mục này lên:
  assets, data, posts, google-apps-script, index.html, admin.html,
  vay-tin-chap.html, the-tin-dung.html, bao-hiem.html,
  de-xuat-san-pham.html, cam-on.html, robots.txt, sitemap.xml.
- Commit changes.
- Chờ 1-2 phút.
- Mở: https://thanhbn2910.github.io/taichinh247vn/?v=152

2) Kiểm tra file tĩnh
- CSS: https://thanhbn2910.github.io/taichinh247vn/assets/style.css
- JS:  https://thanhbn2910.github.io/taichinh247vn/assets/app.js
Nếu 2 link trên hiện code là upload đủ.

3) Cài CRM thật bằng Google Sheet
- Tạo Google Sheet tên CRM_TaiChinh247.
- Extensions -> Apps Script.
- Copy toàn bộ google-apps-script/Code.gs dán vào Apps Script.
- Deploy -> New deployment -> Web app.
- Execute as: Me.
- Who has access: Anyone.
- Copy Web App URL.
- Mở assets/app.js, sửa dòng:
  GAS_URL:''
thành:
  GAS_URL:'https://script.google.com/macros/s/XXXXX/exec'
- Upload lại riêng assets/app.js lên GitHub và Commit.

4) Test
- Vào trang chủ, điền form tư vấn.
- Vào admin.html xem lead.
- Nếu đã gắn Apps Script, mở Google Sheet sẽ thấy lead.
- Nếu chưa gắn Apps Script, dữ liệu lưu tạm local trên trình duyệt.

5) Nội dung V15.2
- Landing vay tín chấp, thẻ tín dụng, bảo hiểm.
- Trang đề xuất sản phẩm affiliate.
- AI chatbot fallback local, có thể nâng bằng OPENAI_API_KEY trong Code.gs.
- CRM pipeline: Mới, Đang gọi, Quan tâm, Chốt, Hủy.
- Lịch gọi, ghi chú, xuất CSV.
- Dashboard doanh thu dự kiến và hoa hồng.
- Tracking nguồn lead + UTM.
