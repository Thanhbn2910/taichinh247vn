function doGet(e){
  return ContentService
    .createTextOutput(JSON.stringify({
      ok:true,
      app:"VayNhanh247",
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
      sh.appendRow(['Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','UTM']);
    }

    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const req = JSON.parse(raw);
    const data = req.lead || req;

    const name = data.name || data.hoten || '';
    const phone = data.phone || data.sdt || '';
    const email = data.email || '';
    const product = data.service || data.product || data.sanpham || 'Tư vấn tài chính';
    const income = data.income || data.thunhap || '';
    const need = data.need || data.note || data.nhucau || '';
    const utm = [
      data.utm_source || req.utm_source || '',
      data.utm_medium || req.utm_medium || '',
      data.utm_campaign || req.utm_campaign || ''
    ].filter(Boolean).join(' / ');

    sh.appendRow([new Date(), name, phone, email, product, income, need, utm]);

    MailApp.sendEmail({
      to: 'buingocthanh29@gmail.com',
      subject: 'Lead mới VayNhanh247 - ' + product,
      htmlBody:
        '<b>LEAD MỚI VAYNHANH247</b><br><br>' +
        'Họ tên: ' + name + '<br>' +
        'SĐT: ' + phone + '<br>' +
        'Email: ' + email + '<br>' +
        'Sản phẩm: ' + product + '<br>' +
        'Thu nhập: ' + income + '<br>' +
        'Nhu cầu: ' + need + '<br>' +
        'UTM: ' + utm
    });

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, message:'Lead saved'}))
      .setMimeType(ContentService.MimeType.JSON);

  }catch(err){
    return ContentService
      .createTextOutput(JSON.stringify({ok:false,error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
