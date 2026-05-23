// V20.9 — Production Real Leads: Google Sheet + Gmail + CRM sync
const SHEET_NAME = 'Leads';
const ADMIN_EMAIL = Session.getActiveUser().getEmail();

const HEADERS = [
  'Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','Ghi chú',
  'Nguồn UTM','Kênh UTM','Chiến dịch UTM','Nội dung UTM','URL',
  'Trạng thái','Phân loại','AI Score','AI Grade','Lịch hẹn gọi lại',
  'Timeline','Nhật ký chăm sóc','Kịch bản gọi','Doanh thu dự kiến','Hoa hồng thực nhận',
  'Chi phí','CPA','CPL','ROAS','Cập nhật lúc'
];

function doGet(e){
  return ContentService.createTextOutput(JSON.stringify({
    ok:true, app:'VayNhanh247', version:'V20.9 Production Filter Fix', status:'running'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  try{
    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const req = JSON.parse(body);
    const action = req.action || 'create';
    if(action === 'list') return jsonOut({ok:true, data:listLeads_()});
    if(action === 'update') return jsonOut(updateLead_(req.id, req.patch || {}));
    if(action === 'logCare') return jsonOut(logCare_(req.id, req.log || {}));
    if(action === 'create') return jsonOut(createLead_(req.lead || req));
    return jsonOut({ok:false,error:'Unknown action: '+action});
  }catch(err){
    return jsonOut({ok:false,error:String(err && err.message || err)});
  }
}

function jsonOut(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sh_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh) sh = ss.insertSheet(SHEET_NAME);
  ensureHeader_(sh);
  return sh;
}

function ensureHeader_(sh){
  const row = sh.getRange(1,1,1,Math.max(HEADERS.length, sh.getLastColumn() || 1)).getValues()[0];
  let changed = false;
  HEADERS.forEach((h,i)=>{ if(row[i] !== h){ row[i]=h; changed=true; }});
  if(changed){
    sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
    sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#d9ead3');
    sh.setFrozenRows(1);
    if(!sh.getFilter()) if(!sh.getFilter()) sh.getRange(1,1,1,HEADERS.length).createFilter();
  }
}

function id_(){ return 'LDM' + Math.random().toString(36).slice(2,10).toUpperCase(); }
function now_(){ return new Date(); }
function clean_(v){ return v == null ? '' : String(v); }

function calcAi_(lead){
  const text = [lead.need,lead.service,lead.income,lead.note,lead.utm_source,lead.sourcePage,lead.url].join(' ').toLowerCase();
  let score = 35;
  const income = Number(String(lead.income || '').replace(/\D/g,'')) || 0;
  if(income >= 20000000) score += 25;
  else if(income >= 10000000) score += 18;
  else if(income >= 5000000) score += 10;
  if(/gấp|hôm nay|cần vay|muốn vay|giải ngân|làm hồ sơ/.test(text)) score += 25;
  if(/cic|nợ xấu|nhóm 2|nhóm 3/.test(text)) score += 10;
  if(/vay tín chấp|thẻ tín dụng|bảo hiểm|cic/.test(text)) score += 8;
  if(/facebook|ads|utm/.test(text)) score += 8;
  if(/seo|google|blog|organic/.test(text)) score += 6;
  if(String(lead.phone||'').replace(/\D/g,'').length >= 9) score += 10;
  if(/tham khảo|tìm hiểu|sau|chưa cần/.test(text)) score -= 18;
  score = Math.max(0, Math.min(100, score));
  return {score:score, grade: score>=75?'A':score>=50?'B':'C', temp: score>=75?'Nóng':score>=50?'Ấm':'Lạnh'};
}

function scriptFor_(service){
  service = String(service||'').toLowerCase();
  if(service.indexOf('cic')>=0 || service.indexOf('nợ xấu')>=0) return 'Hỏi nhóm nợ, đã tất toán chưa, thu nhập hiện tại, cần vay hay cần xử lý CIC.';
  if(service.indexOf('thẻ')>=0) return 'Hỏi thu nhập, nhận lương qua đâu, hạn mức mong muốn, lịch sử tín dụng.';
  if(service.indexOf('bảo hiểm')>=0) return 'Hỏi độ tuổi, ngân sách, mục tiêu bảo vệ sức khỏe/nhân thọ/tai nạn.';
  return 'Hỏi số tiền cần vay, thu nhập, CIC, hồ sơ đang có và thời gian cần giải ngân.';
}

function createLead_(lead){
  const sh = sh_();
  const ai = calcAi_(lead);
  const id = clean_(lead.id) || id_();
  const timeline = JSON.stringify([{time:new Date().toISOString(), action:'created', note:'Lead mới từ web/form/AI'}]);
  const row = [
    id, now_(), clean_(lead.name), clean_(lead.phone), clean_(lead.email), clean_(lead.service || lead.product),
    clean_(lead.income), clean_(lead.need), clean_(lead.note),
    clean_(lead.utm_source), clean_(lead.utm_medium), clean_(lead.utm_campaign), clean_(lead.utm_content), clean_(lead.url || lead.sourcePage),
    clean_(lead.status || 'Lead mới'), clean_(lead.leadType || ai.temp), clean_(lead.aiScore || ai.score), clean_(lead.aiGrade || ai.grade), clean_(lead.callbackAt),
    timeline, clean_(lead.careNote), scriptFor_(lead.service || lead.product), Number(lead.expectedCommission || 0), Number(lead.realRevenue || 0),
    Number(lead.cost || 0), '', '', '', now_()
  ];
  sh.appendRow(row);
  sendMail_(row);
  return {ok:true, id:id, aiScore:ai.score, aiGrade:ai.grade, leadType:ai.temp};
}

function listLeads_(){
  const sh = sh_();
  const values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  const h = values[0];
  return values.slice(1).filter(r=>r[0]).map(r => ({
    id:r[0], createdAt:r[1], name:r[2], phone:r[3], email:r[4], service:r[5], income:r[6], need:r[7], note:r[8],
    utm_source:r[9], utm_medium:r[10], utm_campaign:r[11], utm_content:r[12], url:r[13],
    status:r[14] || 'Lead mới', leadType:r[15] || 'Ấm', aiScore:r[16] || 0, aiGrade:r[17] || 'C', callbackAt:r[18],
    timeline:r[19], careNote:r[20], callScript:r[21], expectedCommission:r[22] || 0, realRevenue:r[23] || 0,
    cost:r[24] || 0, cpa:r[25], cpl:r[26], roas:r[27], updatedAt:r[28]
  }));
}

function findRow_(id){
  const sh = sh_();
  const ids = sh.getRange(2,1,Math.max(0,sh.getLastRow()-1),1).getValues().flat().map(String);
  const idx = ids.indexOf(String(id));
  return idx >= 0 ? idx + 2 : -1;
}

function headerMap_(){
  const sh = sh_();
  const h = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const m = {};
  h.forEach((x,i)=>m[x]=i+1);
  return m;
}

function fieldMap_(field){
  const map = {
    status:'Trạng thái', leadType:'Phân loại', aiScore:'AI Score', aiGrade:'AI Grade',
    callbackAt:'Lịch hẹn gọi lại', timeline:'Timeline', careNote:'Nhật ký chăm sóc',
    callScript:'Kịch bản gọi', expectedCommission:'Doanh thu dự kiến', realRevenue:'Hoa hồng thực nhận',
    cost:'Chi phí', cpa:'CPA', cpl:'CPL', roas:'ROAS', updatedAt:'Cập nhật lúc'
  };
  return map[field] || field;
}

function updateLead_(id, patch){
  const sh = sh_();
  const row = findRow_(id);
  if(row < 0) return {ok:false,error:'Lead not found'};
  const hmap = headerMap_();
  Object.keys(patch).forEach(k=>{
    const header = fieldMap_(k);
    const col = hmap[header];
    if(col) sh.getRange(row,col).setValue(patch[k]);
  });
  if(hmap['Cập nhật lúc']) sh.getRange(row,hmap['Cập nhật lúc']).setValue(now_());
  appendTimeline_(row, {action:'update', patch:patch});
  return {ok:true};
}

function appendTimeline_(row, item){
  const sh = sh_();
  const hmap = headerMap_();
  const col = hmap['Timeline'];
  if(!col) return;
  let arr = [];
  try{ arr = JSON.parse(sh.getRange(row,col).getValue() || '[]'); }catch(e){ arr = []; }
  item.time = new Date().toISOString();
  arr.unshift(item);
  sh.getRange(row,col).setValue(JSON.stringify(arr.slice(0,50)));
}

function logCare_(id, log){
  const sh = sh_();
  const row = findRow_(id);
  if(row < 0) return {ok:false,error:'Lead not found'};
  const hmap = headerMap_();
  const col = hmap['Nhật ký chăm sóc'];
  const old = col ? clean_(sh.getRange(row,col).getValue()) : '';
  const line = '['+Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm')+'] '+clean_(log.note || log.text || log.action || '');
  if(col) sh.getRange(row,col).setValue((line + '\n' + old).trim());
  appendTimeline_(row, {action:'care', note:line});
  if(hmap['Cập nhật lúc']) sh.getRange(row,hmap['Cập nhật lúc']).setValue(now_());
  return {ok:true};
}

function sendMail_(row){
  try{
    const email = ADMIN_EMAIL || '';
    if(!email) return;
    const body = 'Lead mới VayNhanh247\n\n' +
      'Mã: '+row[0]+'\nHọ tên: '+row[2]+'\nSĐT: '+row[3]+'\nSản phẩm: '+row[5]+
      '\nNhu cầu: '+row[7]+'\nAI Grade: '+row[17]+'\nAI Score: '+row[16]+'\nNguồn: '+row[9];
    MailApp.sendEmail(email, 'Lead mới VayNhanh247 - '+row[2], body);
  }catch(e){}
}



// V20.9 Automation fields
const V209_AUTOMATION_FIELDS = ['AI_SCORE','AI_TAG','NEXT_CALL','FOLLOWUP_DAY','STATUS','PRODUCT_SUGGEST','TIMELINE'];

function v209ScoreLead_(lead){
  const text = [lead.need, lead.service, lead.income, lead.note, lead.utm_source, lead.sourcePage].join(' ').toLowerCase();
  let score = 35;
  const income = Number(String(lead.income || '').replace(/\D/g,'')) || 0;
  if(income >= 20000000) score += 25;
  else if(income >= 10000000) score += 18;
  else if(income >= 5000000) score += 10;
  if(/gấp|hôm nay|cần vay|muốn vay|giải ngân|làm hồ sơ/.test(text)) score += 25;
  if(/cic|nợ xấu|nhóm 2|nhóm 3/.test(text)) score += 12;
  if(/facebook|ads|utm/.test(text)) score += 8;
  if(/seo|google|blog|organic/.test(text)) score += 6;
  if(String(lead.phone||'').replace(/\D/g,'').length >= 9) score += 10;
  if(/tham khảo|tìm hiểu|sau|chưa cần/.test(text)) score -= 18;
  score = Math.max(0, Math.min(100, score));
  return {score:score, tag:score>=75?'🔥 Nóng':score>=50?'🌤 Ấm':'❄ Lạnh', grade:score>=75?'A':score>=50?'B':'C'};
}

function v209Followup_(grade){
  if(grade === 'A') return {next:'Gọi ngay trong 1 giờ', day:'D1', suggest:'Ưu tiên gọi ngay'};
  if(grade === 'B') return {next:'Gọi trong 24 giờ', day:'D3', suggest:'Nuôi và nhắc hồ sơ'};
  return {next:'Nuôi bằng SEO/FAQ', day:'D7', suggest:'Nuôi dài hạn'};
}
