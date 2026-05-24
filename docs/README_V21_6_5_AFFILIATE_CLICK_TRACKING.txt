V21.6.5 AFFILIATE CLICK TRACKING

Hoàn thiện:
- Gắn link ngoài: Ngân hàng/vay, thẻ tín dụng, bảo hiểm.
- Khi khách click link ngoài, hệ thống gửi event về GAS/Sheet/CRM trước.
- CRM biết:
  ai click (nếu có thông tin),
  click bài nào,
  nguồn SEO nào,
  sản phẩm nào,
  đối tác/link nào.
- Không thay đổi flow form lead chính.

Cách thay link thật:
Tìm trong index.html hoặc landing/san-pham-tai-chinh.html:
https://example.com/loan-aff
https://example.com/card-aff
https://example.com/insurance-aff

Thay bằng link affiliate thật.

Cách dùng nút mới:
<a data-affiliate="1" data-type="loan" data-product="Vay tín chấp" data-target="Tên đối tác" href="LINK_AFF" target="_blank">Đăng ký</a>
