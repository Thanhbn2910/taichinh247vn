# V21 FULL — Realtime AI CRM

Bản đầy đủ đưa thẳng vào repo đang chạy.

Luồng:
Web → GAS → Google Sheet → CRM → AI realtime

Có:
- Form web tự gửi lead realtime.
- Apps Script tự chấm AI_SCORE, AI_GRADE, AI_TAG.
- Tự ghi NEXT_CALL, FOLLOWUP_DAY, PRODUCT_SUGGEST, TIMELINE xuống Sheet.
- Admin CRM đọc trực tiếp Sheet.
- CRM lọc A/B/C, tag nóng/ấm/lạnh.
- Nhật ký chăm sóc lưu lại Sheet.
- AI FAQ: CIC, nợ xấu, BHNT, vay tín chấp.
- Sửa text lặp Solo Operator.
- Sửa Zalo sắp cập nhật bị lặp.

Sau upload cần:
1. Copy google-apps-script/Code.gs vào Apps Script.
2. Deploy New version.
3. Test:
https://thanhbn2910.github.io/Vaynhanh247vn/index.html?v=21
https://thanhbn2910.github.io/Vaynhanh247vn/admin.html?v=21
https://thanhbn2910.github.io/Vaynhanh247vn/reports/v21-realtime-ai-crm-dashboard.html
