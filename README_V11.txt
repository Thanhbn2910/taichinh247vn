# finance_consumer_site_v11_ai_crm_admin

Bản V11 cho dự án Web TÀI CHÍNH / taichinh247vn.

## Có gì mới
- AI chatbot tài chính nổi trên website.
- Chatbot trả lời nhanh về vay tín chấp, vay mua xe, vay mua nhà, thẻ tín dụng, bảo hiểm, CIC.
- Chatbot có form thu lead gửi về Gmail qua FormSubmit.
- Admin panel: `/admin.html`
- CRM quản lý lead bằng LocalStorage.
- Pipeline: Lead mới → Đang gọi → Quan tâm → Chốt → Hủy.
- Dashboard KPI lead.
- Thêm lead/lịch gọi thủ công.
- Xuất lead ra CSV.
- Khung đăng bài SEO/admin content.
- Template Google Apps Script để nâng cấp V12 sang CRM đồng bộ Google Sheet.

## Cách chạy
1. Giải nén file zip.
2. Upload toàn bộ thư mục lên Netlify.
3. Truy cập:
   - Trang chủ: `/`
   - Admin CRM: `/admin.html`

## Lưu ý
Bản V11 vẫn là web tĩnh. CRM trong `/admin.html` lưu dữ liệu trên trình duyệt bằng LocalStorage.
Muốn lead từ mọi khách tự động đổ về CRM đa thiết bị, bản V12 nên nối Google Sheet/Apps Script hoặc Supabase/Firebase.
