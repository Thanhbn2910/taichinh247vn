V14-GH PRO STABLE

Mục tiêu:
- Bản giao diện đẹp và ổn định riêng cho GitHub Pages.
- Sử dụng đường dẫn tương đối: assets/style.css, assets/app.js, admin.html...
- Không dùng /assets/... để tránh lỗi khi chạy ở /taichinh247vn/.

Cách cài:
1. Giải nén ZIP.
2. Mở thư mục vừa giải nén.
3. Chọn TẤT CẢ file/folder bên trong:
   assets/
   data/
   google-apps-script/
   index.html
   admin.html
   vay-tin-chap.html
   the-tin-dung.html
   bao-hiem.html
   de-xuat-san-pham.html
   cam-on.html
   robots.txt
   sitemap.xml
4. Vào GitHub repo taichinh247vn.
5. Add file -> Upload files.
6. Kéo toàn bộ vào -> Commit changes.
7. Chờ GitHub Pages build 1-2 phút.
8. Check:
   https://thanhbn2910.github.io/taichinh247vn/?v=14gh
   https://thanhbn2910.github.io/taichinh247vn/admin.html?v=14gh

Nếu muốn Google Sheet:
- Copy google-apps-script/Code.gs vào Google Apps Script.
- Deploy Web App.
- Dán link vào assets/app.js tại GAS_URL.
