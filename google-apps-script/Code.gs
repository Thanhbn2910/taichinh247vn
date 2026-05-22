function doGet(e){
  return ContentService
    .createTextOutput(JSON.stringify({
      ok:true,
      app:"VayNhanh247",
      version:"V18.7.1",
      status:"running"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  try{
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName('Leads');

    if(!sh){
      sh = ss.insertSheet('Leads');
    }

    // Đã Việt hóa toàn bộ tiêu đề cột Google Sheet
    const headers = [
      'Mã lead',
      'Thời gian',
      'Họ tên',
      'SĐT',
      'Email',
      'Sản phẩm',
      'Thu nhập',
      'Nhu cầu',
      'Ghi chú',
      'Nguồn UTM',
      'Kênh UTM',
      'Chiến dịch UTM',
      'Nội dung UTM',
      'Từ khóa UTM',
      'Trang nguồn',
      'Liên kết',
      'Trạng thái'
    ];

    const firstRow = sh.getRange(1,1,1,headers.length).getValues()[0];
    if(String(firstRow[0]).toLowerCase() !== 'mã lead'){
      sh.clear();
      sh.appendRow(headers);
    }

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const body = JSON.parse(raw);

    // Website có thể gửi {action:'create', lead:{...}} hoặc gửi thẳng {...}
    const lead = body.lead || body;

    const id = lead.id || ('LD' + Date.now().toString(36).toUpperCase());
    const createdAt = new Date();

    const name = lead.name || lead.hoten || lead.fullName || '';
    const phone = lead.phone || lead.sdt || lead.mobile || '';
    const email = lead.email || '';
    const service = lead.service || lead.product || lead.sanpham || 'Tư vấn tài chính';
    const income = lead.income || lead.thunhap || '';
    const need = lead.need || lead.nhucau || lead.note || '';
    const note = lead.note || lead.need || lead.nhucau || '';
    const status = lead.status || 'Mới';

    const utm_source = lead.utm_source || body.utm_source || '';
    const utm_medium = lead.utm_medium || body.utm_medium || '';
    const utm_campaign = lead.utm_campaign || body.utm_campaign || '';
    const utm_content = lead.utm_content || body.utm_content || '';
    const utm_term = lead.utm_term || body.utm_term || '';
    const sourcePage = lead.sourcePage || lead.source || body.source || '';
    const url = lead.url || body.url || '';

    sh.appendRow([
      id,
      createdAt,
      name,
      phone,
      email,
      service,
      income,
      need,
      note,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      sourcePage,
      url,
      status
    ]);

    MailApp.sendEmail({
      to: 'buingocthanh29@gmail.com',
      subject: 'Lead mới VayNhanh247 - ' + service,
      htmlBody:
        '<h2>LEAD MỚI VAYNHANH247</h2>' +
        '<p><b>Mã lead:</b> ' + id + '</p>' +
        '<p><b>Thời gian:</b> ' + createdAt + '</p>' +
        '<p><b>Họ tên:</b> ' + name + '</p>' +
        '<p><b>SĐT:</b> ' + phone + '</p>' +
        '<p><b>Email:</b> ' + email + '</p>' +
        '<p><b>Sản phẩm:</b> ' + service + '</p>' +
        '<p><b>Thu nhập:</b> ' + income + '</p>' +
        '<p><b>Nhu cầu:</b> ' + need + '</p>' +
        '<p><b>Ghi chú:</b> ' + note + '</p>' +
        '<p><b>Nguồn UTM:</b> ' + utm_source + '</p>' +
        '<p><b>Kênh UTM:</b> ' + utm_medium + '</p>' +
        '<p><b>Chiến dịch UTM:</b> ' + utm_campaign + '</p>' +
        '<p><b>Trang nguồn:</b> ' + sourcePage + '</p>' +
        '<p><b>Liên kết:</b> ' + url + '</p>'
    });

    return ContentService
      .createTextOutput(JSON.stringify({
        ok:true,
        data:{
          id:id,
          createdAt:createdAt,
          name:name,
          phone:phone,
          service:service,
          status:status
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);

  }catch(err){
    return ContentService
      .createTextOutput(JSON.stringify({
        ok:false,
        error:String(err)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
