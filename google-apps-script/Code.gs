/*
V18 — VayNhanh247 Lead thật
Web -> Google Apps Script -> Google Sheet + Gmail
Hướng dẫn:
1. Tạo Google Sheet mới, đặt tên ví dụ: VayNhanh247 Leads.
2. Extensions -> Apps Script.
3. Dán toàn bộ Code.gs này.
4. Deploy -> New deployment -> Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Copy Web App URL dán vào assets/app.js dòng GAS_URL:''.
*/

const LEAD_EMAIL = 'buingocthanh29@gmail.com';
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const action = data.action || '';
    if (action === 'create') return createLead_(data.lead || {}, data);
    if (action === 'chat') return json_({ok:true, answer: chatAnswer_(data.message || '')});
    if (action === 'list') return listLeads_();
    if (action === 'update') return updateLead_(data.id, data.patch || {});
    return json_({ok:false, error:'Unknown action'});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['id','createdAt','name','phone','email','service','income','need','note','utm_source','utm_medium','utm_campaign','utm_content','utm_term','source','url','status']);
  }
  return sh;
}

function createLead_(lead, raw) {
  const sh = getSheet_();
  const id = 'LD' + Date.now().toString(36).toUpperCase();
  const createdAt = new Date();
  const row = [
    id,
    createdAt,
    lead.name || '',
    lead.phone || '',
    lead.email || '',
    lead.service || 'Tư vấn tài chính',
    lead.income || '',
    lead.need || lead.note || '',
    lead.note || lead.need || '',
    lead.utm_source || raw.utm_source || '',
    lead.utm_medium || raw.utm_medium || '',
    lead.utm_campaign || raw.utm_campaign || '',
    lead.utm_content || raw.utm_content || '',
    lead.utm_term || raw.utm_term || '',
    lead.source || lead.sourcePage || '',
    lead.url || '',
    'Mới'
  ];
  sh.appendRow(row);
  sendLeadEmail_(id, lead, createdAt);
  return json_({ok:true, data:{id:id, createdAt:createdAt, status:'Mới'}});
}

function sendLeadEmail_(id, lead, createdAt) {
  const subject = 'LEAD MỚI - VayNhanh247 - ' + (lead.service || 'Tư vấn tài chính');
  const body =
    'LEAD MỚI\n\n' +
    'Mã lead: ' + id + '\n' +
    'Thời gian: ' + createdAt + '\n' +
    'Họ tên: ' + (lead.name || '') + '\n' +
    'SĐT: ' + (lead.phone || '') + '\n' +
    'Email: ' + (lead.email || '') + '\n' +
    'Sản phẩm: ' + (lead.service || '') + '\n' +
    'Thu nhập: ' + (lead.income || '') + '\n' +
    'Nhu cầu: ' + (lead.need || lead.note || '') + '\n' +
    'Nguồn: ' + (lead.sourcePage || lead.source || '') + '\n' +
    'URL: ' + (lead.url || '') + '\n';
  MailApp.sendEmail(LEAD_EMAIL, subject, body);
}

function listLeads_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  const data = values.map(r => {
    const o = {};
    headers.forEach((h,i)=>o[h]=r[i]);
    return o;
  }).reverse();
  return json_({ok:true, data:data});
}

function updateLead_(id, patch) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('id') + 1;
  const statusCol = headers.indexOf('status') + 1;
  for (let r=2; r<=values.length; r++) {
    if (String(sh.getRange(r,idCol).getValue()) === String(id)) {
      if (patch.status && statusCol > 0) sh.getRange(r,statusCol).setValue(patch.status);
      return json_({ok:true});
    }
  }
  return json_({ok:false, error:'Lead not found'});
}

function chatAnswer_(msg) {
  msg = String(msg).toLowerCase();
  if (msg.indexOf('cic') >= 0 || msg.indexOf('nợ xấu') >= 0) return 'Bạn cần kiểm tra nhóm nợ, thời gian tất toán và hồ sơ hiện tại. Hãy để lại SĐT để được tư vấn hướng xử lý CIC/nợ xấu.';
  if (msg.indexOf('vay') >= 0) return 'Để gợi ý khoản vay, G cần biết thu nhập/tháng, số tiền muốn vay, hình thức nhận lương và tình trạng CIC.';
  if (msg.indexOf('thẻ') >= 0) return 'Mở thẻ tín dụng nên xem thu nhập, phí thường niên, hạn mức và ưu đãi hoàn tiền/trả góp.';
  if (msg.indexOf('bảo hiểm') >= 0) return 'Bảo hiểm nên chọn theo mục tiêu: sức khỏe, tai nạn, tích lũy hoặc bảo vệ gia đình.';
  return 'G có thể tư vấn vay tín chấp, CIC, thẻ tín dụng, bảo hiểm và tài chính cá nhân. Bạn cho G biết nhu cầu và số điện thoại nhé.';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
