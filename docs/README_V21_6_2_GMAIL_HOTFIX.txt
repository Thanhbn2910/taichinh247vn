V21.6.2 GMAIL HOTFIX

Sửa lỗi lead vào Sheet/CRM nhưng chưa gửi Gmail.

Điểm sửa:
- google-apps-script/Code.gs dùng email nhận cố định: buingocthanh29@gmail.com
- Gửi mail bằng MailApp.sendEmail(...)
- doPost trả về mail_status: sent / error
- Thêm hàm testSendLeadEmail_V2162 để cấp quyền Gmail lần đầu.

Sau khi upload web:
1. Mở Apps Script.
2. Dán toàn bộ google-apps-script/Code.gs mới.
3. Chọn hàm testSendLeadEmail_V2162 -> Run.
4. Cấp quyền Google/MailApp.
5. Deploy -> Manage deployments -> Edit -> New version -> Deploy.
6. Test lại form.

Nếu chưa thấy mail:
- kiểm tra Spam/Promotions,
- mở Apps Script Executions xem mail_error.
