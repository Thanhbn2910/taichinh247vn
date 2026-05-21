BẢN GITHUB PAGES FIXED

Mục đích:
- Sửa lỗi chạy trên GitHub Pages dạng:
  https://thanhbn2910.github.io/taichinh247vn/
- Đã đổi các đường dẫn tuyệt đối kiểu /assets/... thành đường dẫn tương đối assets/...
- Tránh lỗi mất CSS/JS khi website nằm trong thư mục con /taichinh247vn/.

Cách upload:
1. Giải nén ZIP này.
2. Mở thư mục vừa giải nén.
3. Chọn TẤT CẢ file/folder bên trong, ví dụ:
   assets/
   data/
   google-apps-script/
   posts/
   index.html
   admin.html
   cam-on.html
   robots.txt
   sitemap.xml
   ...
4. Vào GitHub repo taichinh247vn.
5. Add file -> Upload files.
6. Kéo toàn bộ file/folder vào.
7. Commit changes.
8. Chờ GitHub Pages build 1-2 phút.
9. Check:
   https://thanhbn2910.github.io/taichinh247vn/?v=github-fixed
   https://thanhbn2910.github.io/taichinh247vn/admin.html?v=github-fixed

Lưu ý:
- Không upload nguyên thư mục cha nếu GitHub tạo thêm một thư mục lồng bên trong repo.
- Phải thấy index.html nằm ngay ngoài cùng repo.
