# V21.5.5 CRM Income Field Fix

Sửa lỗi:
- Khách đăng ký có nhập Thu nhập nhưng CRM chưa hiển thị mục này.

Đã thêm:
- assets/crm-income-v21-5-5.js
- assets/crm-income-v21-5-5.css
- admin.html load thêm patch hiển thị cột Thu nhập.
- form-submit thêm alias: income, thu_nhap, Thu nhập.
- GAS đọc thêm alias thu_nhap.

Lưu ý:
- Nếu CRM đang đọc dữ liệu cũ chưa có thu nhập thì hiển thị "Chưa có".
- Lead mới sau bản này sẽ có Thu nhập đầy đủ hơn.
