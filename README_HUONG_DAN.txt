FINANCE CONSUMER SITE V13 - REAL CRM

Bản này nâng từ V12 lên V13 CRM thật.

TÍNH NĂNG MỚI:
1. Form lead ngoài website.
2. Admin CRM tại /admin.html.
3. Pipeline trạng thái: Mới, Đang gọi, Quan tâm, Chốt, Hủy.
4. Lịch gọi lại theo ngày giờ.
5. Dashboard KPI realtime từ dữ liệu lead.
6. Xuất CSV.
7. Google Apps Script để lưu dữ liệu vào Google Sheet thật.
8. Local fallback: chưa kết nối Sheet vẫn test được bằng trình duyệt.

CÁCH UPLOAD NETLIFY:
- Giải nén file zip.
- Kéo toàn bộ thư mục vào Netlify Deploys.

CÁCH KẾT NỐI GOOGLE SHEET:
1. Tạo Google Sheet mới.
2. Đặt sheet đầu tiên tên: Leads.
3. Vào Extensions > Apps Script.
4. Dán nội dung google-apps-script/Code.gs.
5. Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copy Web App URL.
9. Mở assets/app.js, tìm GAS_URL:'' và dán URL vào giữa dấu nháy.
10. Upload lại lên Netlify.

LƯU Ý:
- /admin.html hiện chưa có đăng nhập thật. Không public link admin rộng rãi.
- V14 sẽ nâng AI chatbot thật hơn, có kịch bản hỏi đáp và chấm điểm lead.
