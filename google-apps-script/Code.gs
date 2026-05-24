// V21.6.4 CRM SYNC FIX — Web -> GAS -> Sheet -> CRM -> Gmail
const SHEET_NAME = 'Leads';
const NOTIFY_EMAIL = 'buingocthanh29@gmail.com';

const HEADERS = [
  'Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','Ghi chú',
  'Nguồn','Nguồn UTM','Kênh UTM','Chiến dịch UTM','Nội dung UTM','URL',
  'STATUS','AI_SCORE','AI_GRADE','AI_TAG','NEXT_CALL','FOLLOWUP_DAY','PRODUCT_SUGGEST','TIMELINE',
  'Lịch hẹn gọi lại','Nhật ký chăm sóc','Kịch bản gọi','Doanh thu dự kiến','Hoa hồng thực nhận',
  'Chi phí','CPA','CPL','ROAS','Cập nhật lúc'
];

function doGet(e){
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'list';
  if(action === 'list') return out_({ok:true,data:listLeads_()});
  return out_({ok:true,version:'V21.6.4_CRM_SYNC_FIX',data:listLeads_(),email_to:NOTIFY_EMAIL});
}

function doPost(e){
  try{
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    let req = {};
    try{ req = JSON.parse(raw); }catch(parseErr){ req = {}; }

    const action = req.action || 'create';

    if(action === 'create' || action === 'addLead'){
      const lead = req.lead || req;
      const result = createLead_(lead);
      return out_(result);
    }

    if(action === 'list') return out_({ok:true,data:listLeads_()});
    if(action === 'update') return out_(updateLead_(req.id, req.patch || {}));
    if(action === 'logCare') return out_(logCare_(req.id, req.log || {}));

    return out_({ok:false,error:'Unknown action ' + action});
  }catch(err){
    return out_({ok:false,error:String(err.message || err)});
  }
}

function out_(o){
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss_(){
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sh_(){
  const ss = ss_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh) sh = ss.insertSheet(SHEET_NAME);

  if(sh.getLastRow() === 0){
    sh.appendRow(HEADERS);
  }else{
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const existing = sh.getRange(1,1,1,lastCol).getValues()[0].map(String);
    HEADERS.forEach(h => {
      if(existing.indexOf(h) === -1){
        sh.getRange(1, sh.getLastColumn()+1).setValue(h);
      }
    });
  }
  return sh;
}

function val_(obj, keys, fallback){
  obj = obj || {};
  for(let i=0;i<keys.length;i++){
    const k = keys[i];
    if(obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') return String(obj[k]).trim();
  }
  return fallback || '';
}

function cleanPhone_(v){
  return String(v || '').replace(/\D/g,'');
}

function scoreLead_(lead){
  const text = JSON.stringify(lead || {}).toLowerCase();
  let score = 30;
  const incomeRaw = val_(lead, ['income','thu_nhap','Thu nhập'], '');
  let income = 0;
  const m = incomeRaw.toLowerCase().replace(/,/g,'.').match(/(\d+(?:\.\d+)?)/);
  if(m){
    income = parseFloat(m[1]);
    if(incomeRaw.toLowerCase().indexOf('tr') >= 0 || incomeRaw.toLowerCase().indexOf('triệu') >= 0 || incomeRaw.toLowerCase().indexOf('trieu') >= 0) income *= 1000000;
  }
  if(income > 20000000) score += 20;
  if(text.indexOf('cic tốt') >= 0 || text.indexOf('cic tot') >= 0 || text.indexOf('nhóm 1') >= 0 || text.indexOf('nhom 1') >= 0) score += 15;
  if(text.indexOf('vay tín chấp') >= 0 || text.indexOf('vay tin chap') >= 0) score += 10;
  const phone = cleanPhone_(val_(lead, ['phone','sdt','tel','SĐT'], ''));
  const need = val_(lead, ['need','nhu_cau','message','Nhu cầu'], '');
  if(phone.length >= 9 && need.length >= 5) score += 10;
  if(text.indexOf('nợ xấu') >= 0 || text.indexOf('no xau') >= 0 || text.indexOf('nhóm 2') >= 0 || text.indexOf('nhom 2') >= 0) score -= 15;
  if(text.indexOf('nhóm 3') >= 0 || text.indexOf('nhom 3') >= 0 || text.indexOf('nhóm 4') >= 0 || text.indexOf('nhom 4') >= 0 || text.indexOf('nhóm 5') >= 0 || text.indexOf('nhom 5') >= 0) score -= 25;
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 60 ? 'A' : (score >= 35 ? 'B' : 'C');
  const tag = grade === 'A' ? '🔥 A nóng' : (grade === 'B' ? '🌤 B trung bình' : '❄ C nuôi');
  return {score:score, grade:grade, tag:tag};
}

function timeline_(){
  return 'D0 Mới → D1 Gọi → D3 Nhắc → D7 Nuôi → D14 Chốt → Quá hạn';
}

function source_(lead){
  const src = val_(lead, ['source','Nguồn','utm_source','Nguồn UTM'], '');
  const url = val_(lead, ['sourcePage','url','URL'], '').toLowerCase();
  const s = src.toLowerCase();
  if(s.indexOf('google') >= 0 || s.indexOf('seo') >= 0) return 'Google SEO';
  if(url.indexOf('/landing/') >= 0 || s.indexOf('landing') >= 0) return 'Landing';
  if(url.indexOf('/posts/') >= 0 || s.indexOf('blog') >= 0 || s.indexOf('posts') >= 0) return 'Blog';
  if(s.indexOf('chat') >= 0 || url.indexOf('source=chat') >= 0) return 'Chat';
  return 'Direct';
}

function rowFromLead_(lead){
  lead = lead || {};
  const now = new Date();
  const ai = scoreLead_(lead);
  const id = val_(lead, ['id','leadId','Mã lead'], '') || ('LD' + now.getTime());
  const service = val_(lead, ['service','product','san_pham','Sản phẩm'], 'Vay tín chấp');
  const src = source_(lead);

  return [
    id,
    now,
    val_(lead, ['name','ho_ten','hoten','Họ tên'], ''),
    cleanPhone_(val_(lead, ['phone','sdt','tel','SĐT'], '')),
    val_(lead, ['email','Email'], ''),
    service,
    val_(lead, ['income','thu_nhap','Thu nhập'], ''),
    val_(lead, ['need','nhu_cau','message','Nhu cầu'], ''),
    val_(lead, ['note','Ghi chú'], ''),
    src,
    val_(lead, ['utm_source','Nguồn UTM'], src),
    val_(lead, ['utm_medium','Kênh UTM'], ''),
    val_(lead, ['utm_campaign','Chiến dịch UTM'], ''),
    val_(lead, ['utm_content','Nội dung UTM'], ''),
    val_(lead, ['sourcePage','url','URL'], ''),
    val_(lead, ['status','STATUS'], 'D0 Mới'),
    val_(lead, ['aiScore','AI_SCORE'], String(ai.score)),
    val_(lead, ['aiGrade','AI_GRADE'], ai.grade),
    val_(lead, ['aiTag','AI_TAG'], ai.tag),
    val_(lead, ['nextCall','NEXT_CALL'], ai.grade === 'A' ? 'Gọi ngay trong 1 giờ' : 'Gọi trong 24 giờ'),
    val_(lead, ['followupDay','FOLLOWUP_DAY'], ai.grade === 'A' ? 'D1' : 'D3'),
    val_(lead, ['productSuggest','PRODUCT_SUGGEST'], service),
    val_(lead, ['timeline','TIMELINE'], timeline_()),
    val_(lead, ['Lịch hẹn gọi lại'], ''),
    val_(lead, ['Nhật ký chăm sóc'], ''),
    val_(lead, ['Kịch bản gọi'], ''),
    val_(lead, ['Doanh thu dự kiến'], ''),
    val_(lead, ['Hoa hồng thực nhận'], ''),
    val_(lead, ['Chi phí'], ''),
    val_(lead, ['CPA'], ''),
    val_(lead, ['CPL'], ''),
    val_(lead, ['ROAS'], ''),
    now
  ];
}

function createLead_(lead){
  const sh = sh_();
  const row = rowFromLead_(lead);
  sh.appendRow(row);

  let mail_status = 'not_sent';
  let mail_error = '';
  try{
    sendLeadMailFromRow_(row);
    mail_status = 'sent';
  }catch(err){
    mail_status = 'error';
    mail_error = String(err.message || err);
  }

  return {
    ok:true,
    id: row[0],
    row: sh.getLastRow(),
    data: rowToObject_(row),
    mail_status: mail_status,
    mail_error: mail_error
  };
}

function rowToObject_(row){
  const obj = {};
  HEADERS.forEach((h,i) => obj[h] = row[i] !== undefined ? row[i] : '');
  obj.id = obj['Mã lead'];
  obj.name = obj['Họ tên'];
  obj.phone = obj['SĐT'];
  obj.service = obj['Sản phẩm'];
  obj.income = obj['Thu nhập'];
  obj.need = obj['Nhu cầu'];
  obj.source = obj['Nguồn'];
  obj.aiScore = obj['AI_SCORE'];
  obj.aiGrade = obj['AI_GRADE'];
  obj.aiTag = obj['AI_TAG'];
  obj.nextCall = obj['NEXT_CALL'];
  obj.followupDay = obj['FOLLOWUP_DAY'];
  obj.timeline = obj['TIMELINE'];
  return obj;
}

function listLeads_(){
  const sh = sh_();
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if(lastRow < 2) return [];
  const values = sh.getRange(2,1,lastRow-1,lastCol).getValues();
  return values.map(r => rowToObject_(r)).reverse();
}

function findRow_(id){
  const sh = sh_();
  const last = sh.getLastRow();
  if(last < 2) return -1;
  const ids = sh.getRange(2,1,last-1,1).getValues().flat().map(String);
  const idx = ids.indexOf(String(id));
  return idx >= 0 ? idx + 2 : -1;
}

function updateLead_(id, patch){
  const sh = sh_();
  const rowNo = findRow_(id);
  if(rowNo < 0) return {ok:false,error:'Lead not found'};
  const header = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  Object.keys(patch || {}).forEach(k => {
    const col = header.indexOf(k);
    if(col >= 0) sh.getRange(rowNo, col+1).setValue(patch[k]);
  });
  sh.getRange(rowNo, header.indexOf('Cập nhật lúc')+1).setValue(new Date());
  return {ok:true,id:id};
}

function logCare_(id, log){
  const sh = sh_();
  const rowNo = findRow_(id);
  if(rowNo < 0) return {ok:false,error:'Lead not found'};
  const header = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  const col = header.indexOf('Nhật ký chăm sóc') + 1;
  const old = sh.getRange(rowNo,col).getValue();
  const item = new Date().toISOString() + ' - ' + (log.note || log || '');
  sh.getRange(rowNo,col).setValue(old ? old + '\n' + item : item);
  return {ok:true,id:id};
}

function sendLeadMailFromRow_(row){
  const subject = 'Lead mới VayNhanh247 - ' + (row[2] || row[3] || row[0]);
  const body =
    'Lead mới từ VayNhanh247\n\n' +
    'Mã lead: ' + row[0] + '\n' +
    'Thời gian: ' + row[1] + '\n' +
    'Họ tên: ' + row[2] + '\n' +
    'SĐT: ' + row[3] + '\n' +
    'Email: ' + row[4] + '\n' +
    'Sản phẩm: ' + row[5] + '\n' +
    'Thu nhập: ' + row[6] + '\n' +
    'Nhu cầu: ' + row[7] + '\n' +
    'Nguồn: ' + row[9] + '\n' +
    'AI: ' + row[17] + ' - ' + row[16] + ' - ' + row[18] + '\n' +
    'Timeline: ' + row[22] + '\n\n' +
    'Vào CRM để xử lý ngay.';
  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function testCreateLead_V2164(){
  return createLead_({
    name:'Test CRM Sync',
    phone:'0912345678',
    service:'Vay tín chấp',
    income:'25 triệu',
    need:'CIC tốt, cần vay tín chấp',
    source:'Google SEO',
    sourcePage:'manual-test'
  });
}
