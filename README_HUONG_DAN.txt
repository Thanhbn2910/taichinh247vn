V18.7.1 — VAYNHANH247 VIỆT HÓA CỘT GOOGLE SHEET

Đã hoàn thiện theo yêu cầu:
- Việt hóa toàn bộ tiêu đề cột trong Google Sheet tab Leads.
- Cập nhật Code.gs để ghi đúng dữ liệu vào các cột tiếng Việt.
- Gmail báo lead cũng dùng nhãn tiếng Việt.
- Giữ nguyên website, CRM, SEO50, landing, GA4, GAS URL.

GAS URL đang dùng:
https://script.google.com/macros/s/AKfycbwzekJhpMXJVSWA1nBSp-OCA_2FGAtY6j57lj724G4YF7SUiYNmd_WI4fpaVm4M220QuA/exec

Tiêu đề cột mới:
Mã lead | Thời gian | Họ tên | SĐT | Email | Sản phẩm | Thu nhập | Nhu cầu | Ghi chú | Nguồn UTM | Kênh UTM | Chiến dịch UTM | Nội dung UTM | Từ khóa UTM | Trang nguồn | Liên kết | Trạng thái

VIỆC CẦN LÀM:
1. Upload toàn bộ bản này lên GitHub repo Vaynhanh247vn.
2. Vào Google Apps Script.
3. Thay toàn bộ Code.gs bằng file:
   google-apps-script/Code.gs
4. Ctrl + S.
5. Triển khai -> Quản lý tùy chọn triển khai -> bút chì -> Phiên bản mới -> Triển khai.
6. Mở GAS URL để kiểm tra, đúng sẽ hiện:
   {"ok":true,"app":"VayNhanh247","version":"V18.7.1","status":"running"}
7. Test web:
   https://thanhbn2910.github.io/Vaynhanh247vn/?v=1871

Lưu ý:
- Khi chạy lần đầu, script sẽ xóa tiêu đề cũ và tạo lại hàng tiêu đề tiếng Việt.
- Nếu muốn giữ dữ liệu test cũ, hãy copy sang sheet khác trước.
