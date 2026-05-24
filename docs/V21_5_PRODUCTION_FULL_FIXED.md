# V21.5 Production Full Fixed

Đóng gói lại từ base source thật, không phải bản 2 file.

Tính năng:
1. Lead scoring thật:
- Thu nhập > 20tr: +20
- CIC tốt / nhóm 1: +15
- Vay tín chấp: +10
- Có SĐT + nhu cầu rõ: +10
- Nợ xấu: trừ điểm
- CRM: A nóng / B trung bình / C nuôi

2. Chat tư vấn → tạo lead:
- Nhận diện nhu cầu
- Nhận diện thu nhập / CIC / nợ xấu
- Hỏi thiếu SĐT
- Tạo lead đẩy Sheet → CRM nếu có SĐT

3. Timeline thật:
- D0 mới
- D1 gọi
- D3 nhắc
- D7 nuôi
- D14 đóng
- Quá hạn cảnh báo đỏ

Base giữ nguyên:
- index.html thật
- admin.html thật
- assets
- google-apps-script
- landing
- posts
- reports
