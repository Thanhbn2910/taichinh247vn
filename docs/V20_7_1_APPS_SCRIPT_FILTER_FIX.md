# V20.7.1 — Apps Script Filter Fix

Đã sửa lỗi:
- Google Sheet đã có bộ lọc nhưng Apps Script vẫn gọi createFilter().
- Lỗi cũ: "Bạn không thể tạo bộ lọc trong một trang tính đã có bộ lọc."

Cách sửa:
- Trong google-apps-script/Code.gs:
  if(!sh.getFilter()) sh.getRange(1,1,1,HEADERS.length).createFilter();

Việc cần làm:
1. Mở Apps Script.
2. Dán lại toàn bộ file google-apps-script/Code.gs bản V20.7.1.
3. Deploy → Manage deployments → Edit → New version → Deploy.
4. Mở lại admin.html?v=2071.
