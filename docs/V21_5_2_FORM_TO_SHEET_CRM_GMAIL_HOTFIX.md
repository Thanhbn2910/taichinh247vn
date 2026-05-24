# V21.5.2 Form -> Sheet/CRM/Gmail Hotfix

Lỗi sửa:
- Form V21.5.1 thiết kế lại nhưng submit không đẩy về GAS.
- Vá submit trực tiếp qua assets/config.js -> GAS_URL.
- Tự build lead, scoring, timeline.
- Gửi payload tương thích nhiều dạng: {action:create, lead}, {action:addLead, lead}, lead.
- GAS Code.gs bổ sung doPost tương thích và email thông báo.
