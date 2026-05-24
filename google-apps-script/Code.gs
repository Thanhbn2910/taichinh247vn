// V21 FULL — Realtime AI CRM: Web -> GAS -> Sheet -> CRM -> AI
const SHEET_NAME = 'Leads';
const HEADERS = [
  'Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','Ghi chú',
  'Nguồn UTM','Kênh UTM','Chiến dịch UTM','Nội dung UTM','URL',
  'STATUS','AI_SCORE','AI_GRADE','AI_TAG','NEXT_CALL','FOLLOWUP_DAY','PRODUCT_SUGGEST','TIMELINE',
  'Lịch hẹn gọi lại','Nhật ký chăm sóc','Kịch bản gọi','Doanh thu dự kiến','Hoa hồng thực nhận',
  'Chi phí','CPA','CPL','ROAS','Cập nhật lúc'
];

function doGet(e){
  return ContentService.createTextOutput(JSON.stringify({ok:true,version:'V21 FULL REALTIME AI CRM'})).setMimeType(ContentService.MimeType.JSON);
}
function doPost(e){
  try{
    const req = JSON.parse(e && e.postData && e.postData.contents ? e.postData.contents : '{}');
    const action = req.action || 'create';

    if(action === 'create' || action === 'addLead'){
      const result = createLead_(req.lead || req);

      try{
        sendLeadMail_(req.lead || req);
      }catch(mailErr){
        result.mail_status = 'error';
        result.mail_error = String(mailErr.message || mailErr);
      }

      return out_(result);
    }

    if(action === 'list') return out_({ok:true,data:listLeads_()});
    if(action === 'update') return out_(updateLead_(req.id, req.patch || {}));
    if(action === 'logCare') return out_(logCare_(req.id, req.log || {}));

    return out_({ok:false,error:'Unknown action '+action});
  }catch(err){
    return out_({ok:false,error:String(err.message||err)});
  }
}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function ss_(){return SpreadsheetApp.getActiveSpreadsheet()}
function sh_(){let sh=ss_().getSheetByName(SHEET_NAME); if(!sh)sh=ss_().insertSheet(SHEET_NAME); ensureHeader_(sh); return sh}
function ensureHeader_(sh){
  const max=Math.max(HEADERS.length, sh.getLastColumn()||1);
  const row=sh.getRange(1,1,1,max).getValues()[0];
  let changed=false;
  HEADERS.forEach((h,i)=>{if(row[i]!==h){row[i]=h;changed=true;}});
  if(changed){
    sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
    sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#d9ead3');
    sh.setFrozenRows(1);
    if(!sh.getFilter()) sh.getRange(1,1,1,HEADERS.length).createFilter();
  }
}
function id_(){return 'LDM'+Math.random().toString(36).slice(2,10).toUpperCase()}
function clean_(v){return v==null?'':String(v)}
function now_(){return new Date()}
function ai_(lead){
  const text=[lead.need,lead.service,lead.income,lead.note,lead.utm_source,lead.url].join(' ').toLowerCase();
  let score=35;
  const income=Number(String(lead.income||'').replace(/\D/g,''))||0;
  if(income>=20000000)score+=25; else if(income>=10000000)score+=18; else if(income>=5000000)score+=10;
  if(/gấp|hôm nay|cần vay|muốn vay|giải ngân|làm hồ sơ/.test(text))score+=25;
  if(/cic|nợ xấu|nhóm 2|nhóm 3/.test(text))score+=12;
  if(/vay tín chấp|thẻ tín dụng|bảo hiểm|cic/.test(text))score+=8;
  if(/facebook|ads|utm/.test(text))score+=8;
  if(/seo|google|blog|organic/.test(text))score+=6;
  if(String(lead.phone||'').replace(/\D/g,'').length>=9)score+=10;
  if(/tham khảo|tìm hiểu|sau|chưa cần/.test(text))score-=18;
  score=Math.max(0,Math.min(100,score));
  const grade=score>=75?'A':score>=50?'B':'C';
  return {score,grade,tag:grade==='A'?'🔥 Nóng':grade==='B'?'🌤 Ấm':'❄ Lạnh'};
}
function product_(lead){
  const t=[lead.need,lead.service].join(' ').toLowerCase();
  if(/cic|nợ xấu|nhóm/.test(t))return 'Tư vấn CIC / nợ xấu';
  if(/thẻ|tín dụng|hạn mức/.test(t))return 'Tư vấn thẻ tín dụng';
  if(/bảo hiểm|nhân thọ|sức khỏe/.test(t))return 'Tư vấn bảo hiểm';
  return 'Tư vấn vay tín chấp';
}
function follow_(grade){
  if(grade==='A')return {next:'Gọi ngay trong 1 giờ',day:'D1',timeline:'D0 Lead mới → D1 Gọi → D3 Nhắc hồ sơ → D7 Cảnh báo mất lead'};
  if(grade==='B')return {next:'Gọi trong 24 giờ',day:'D3',timeline:'D0 Lead mới → D1 Gọi → D3 Nhắc → D7 Nuôi lại'};
  return {next:'Nuôi bằng SEO/FAQ',day:'D7',timeline:'D0 Lead mới → D3 Gửi FAQ → D7 Hỏi lại nhu cầu'};
}
function script_(service){
  service=String(service||'').toLowerCase();
  if(service.includes('cic')||service.includes('nợ xấu'))return 'Hỏi nhóm nợ, đã tất toán chưa, thu nhập hiện tại và hướng xử lý.';
  if(service.includes('thẻ'))return 'Hỏi thu nhập, nhận lương qua đâu, hạn mức mong muốn.';
  if(service.includes('bảo hiểm'))return 'Hỏi độ tuổi, ngân sách, nhu cầu bảo vệ.';
  return 'Hỏi số tiền cần vay, thu nhập, CIC và thời gian cần giải ngân.';
}
function createLead_(lead){
  const sh=sh_(); const ai=ai_(lead); const prod=product_(lead); const fu=follow_(ai.grade);
  const id=clean_(lead.id)||id_();
  const timeline=JSON.stringify([{time:new Date().toISOString(),action:'D0 Lead mới',note:fu.timeline}]);
  const row=[id,now_(),clean_(lead.name),clean_(lead.phone),clean_(lead.email),clean_(lead.service||prod),clean_(lead.income),clean_(lead.need),clean_(lead.note),
    clean_(lead.utm_source),clean_(lead.utm_medium),clean_(lead.utm_campaign),clean_(lead.utm_content),clean_(lead.url),
    clean_(lead.status||'Lead mới'),ai.score,ai.grade,ai.tag,fu.next,fu.day,prod,timeline,clean_(lead.callbackAt),clean_(lead.careNote),script_(prod),
    Number(lead.expectedCommission||0),Number(lead.realRevenue||0),Number(lead.cost||0),'','','',now_()];
  sh.appendRow(row); mail_(row); return {ok:true,id,aiScore:ai.score,aiGrade:ai.grade,aiTag:ai.tag,nextCall:fu.next,productSuggest:prod};
}
function listLeads_(){
  const sh=sh_(); const values=sh.getDataRange().getValues(); if(values.length<2)return [];
  return values.slice(1).filter(r=>r[0]).map(r=>({id:r[0],createdAt:r[1],name:r[2],phone:r[3],email:r[4],service:r[5],income:r[6],need:r[7],note:r[8],utm_source:r[9],utm_medium:r[10],utm_campaign:r[11],utm_content:r[12],url:r[13],status:r[14],aiScore:r[15],aiGrade:r[16],aiTag:r[17],nextCall:r[18],followupDay:r[19],productSuggest:r[20],timeline:r[21],callbackAt:r[22],careNote:r[23],callScript:r[24],expectedCommission:r[25],realRevenue:r[26],cost:r[27],cpa:r[28],cpl:r[29],roas:r[30],updatedAt:r[31]}));
}
function hmap_(){const sh=sh_();const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];const m={};h.forEach((x,i)=>m[x]=i+1);return m}
function findRow_(id){const sh=sh_();const ids=sh.getRange(2,1,Math.max(0,sh.getLastRow()-1),1).getValues().flat().map(String);const i=ids.indexOf(String(id));return i>=0?i+2:-1}
function updateLead_(id,patch){const sh=sh_();const row=findRow_(id);if(row<0)return {ok:false,error:'Lead not found'};const m=hmap_();Object.keys(patch).forEach(k=>{const col=m[k]||m[k.toUpperCase()]||m[field_(k)];if(col)sh.getRange(row,col).setValue(patch[k])});if(m['Cập nhật lúc'])sh.getRange(row,m['Cập nhật lúc']).setValue(now_());return {ok:true}}
function field_(k){return {status:'STATUS',aiScore:'AI_SCORE',aiGrade:'AI_GRADE',aiTag:'AI_TAG',nextCall:'NEXT_CALL',followupDay:'FOLLOWUP_DAY',productSuggest:'PRODUCT_SUGGEST',timeline:'TIMELINE'}[k]||k}
function logCare_(id,log){const sh=sh_();const row=findRow_(id);if(row<0)return {ok:false,error:'Lead not found'};const m=hmap_();const line='['+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'dd/MM/yyyy HH:mm')+'] '+clean_(log.note||log.text||'Care');if(m['Nhật ký chăm sóc']){const old=clean_(sh.getRange(row,m['Nhật ký chăm sóc']).getValue());sh.getRange(row,m['Nhật ký chăm sóc']).setValue((line+'\n'+old).trim())}return {ok:true}}
function mail_(row){try{MailApp.sendEmail(Session.getActiveUser().getEmail(),'Lead mới V21 - '+row[2],'Lead mới V21\\nSĐT: '+row[3]+'\\nAI: '+row[16]+' '+row[17]+'\\nGợi ý: '+row[20])}catch(e){}}


// V21_5_PRODUCTION_SCORE
function v215ScoreLead_(lead) {
  lead = lead || {};
  var text = JSON.stringify(lead).toLowerCase();
  var score = 30;
  var income = Number(String(lead.income || lead.thu_nhap || lead['Thu nhập'] || '').replace(/[^0-9]/g,'')) || 0;
  if (income > 20000000) score += 20;
  if (text.indexOf('cic tốt') >= 0 || text.indexOf('nhóm 1') >= 0) score += 15;
  if (text.indexOf('vay tín chấp') >= 0) score += 10;
  if (String(lead.phone || lead.sdt || '').replace(/\D/g,'').length >= 9 && String(lead.need || lead['Nhu cầu'] || '').length >= 5) score += 10;
  if (text.indexOf('nợ xấu') >= 0 || text.indexOf('nhóm 2') >= 0) score -= 15;
  if (text.indexOf('nhóm 3') >= 0 || text.indexOf('nhóm 4') >= 0 || text.indexOf('nhóm 5') >= 0) score -= 25;
  score = Math.max(0, Math.min(100, score));
  var grade = score >= 60 ? 'A' : (score >= 35 ? 'B' : 'C');
  var tag = grade === 'A' ? '🔥 A nóng' : (grade === 'B' ? '🌤 B trung bình' : '❄ C nuôi');
  return {score: score, grade: grade, tag: tag};
}


// V21_5_2_COMPAT_POST
function v2152Json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function v2152AppendLead_(lead) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
  var headers = ['Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','Ghi chú','Nguồn UTM','Kênh UTM','Chiến dịch UTM','Nội dung UTM','URL','STATUS','AI_SCORE','AI_GRADE','AI_TAG','NEXT_CALL','FOLLOWUP_DAY','PRODUCT_SUGGEST','TIMELINE','Cập nhật lúc'];
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  var s = v215ScoreLead_ ? v215ScoreLead_(lead) : {score: lead.aiScore || '', grade: lead.aiGrade || '', tag: lead.aiTag || ''};
  var now = new Date();
  var row = [
    lead.id || ('LD' + now.getTime()),
    now,
    lead.name || lead['Họ tên'] || '',
    lead.phone || lead.sdt || lead['SĐT'] || '',
    lead.email || '',
    lead.service || lead.product || lead['Sản phẩm'] || '',
    lead.income || lead.thu_nhap || lead['Thu nhập'] || '',
    lead.need || lead['Nhu cầu'] || '',
    lead.note || lead['Ghi chú'] || '',
    lead.source || lead.utm_source || '',
    lead.utm_medium || '',
    lead.utm_campaign || '',
    lead.utm_content || '',
    lead.sourcePage || lead.url || '',
    lead.status || 'D0 Mới',
    lead.aiScore || s.score || '',
    lead.aiGrade || s.grade || '',
    lead.aiTag || s.tag || '',
    lead.nextCall || 'D1 Gọi',
    lead.followupDay || 'D1',
    lead.productSuggest || lead.service || '',
    lead.timeline || 'D0 Mới → D1 Gọi → D3 Nhắc → D7 Nuôi → D14 Chốt → Quá hạn',
    now
  ];
  sh.appendRow(row);
  try {
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: 'Lead mới VayNhanh247: ' + (lead.name || ''),
      body: 'Lead mới\nTên: ' + (lead.name || '') + '\nSĐT: ' + (lead.phone || '') + '\nNhu cầu: ' + (lead.need || '')
    });
  } catch(err) {}
  return {ok:true, id: row[0], row: sh.getLastRow()};
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var lead = data.lead || data;
    return v2152Json_(v2152AppendLead_(lead));
  } catch (err) {
    return v2152Json_({ok:false, error:String(err)});
  }
}


// V21_6_REAL_FULL_SOURCE_PATCH
function v216LeadSource_(lead) { lead = lead || {}; return lead.source || lead.utm_source || lead['Nguồn'] || 'Direct'; }


// ================= V21_6_2_GMAIL_HOTFIX =================
// Email nhận lead cố định
const V2162_NOTIFY_EMAIL = 'buingocthanh29@gmail.com';

function v2162Json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function v2162GetSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('Leads');
  if (!sh) sh = ss.insertSheet('Leads');
  const headers = [
    'Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','Ghi chú',
    'Nguồn','Nguồn UTM','Kênh UTM','Chiến dịch UTM','Nội dung UTM','URL',
    'STATUS','AI_SCORE','AI_GRADE','AI_TAG','NEXT_CALL','FOLLOWUP_DAY','PRODUCT_SUGGEST','TIMELINE','Cập nhật lúc'
  ];
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}

function v2162Val_(lead, keys) {
  lead = lead || {};
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (lead[k] !== undefined && lead[k] !== null && String(lead[k]).trim() !== '') return String(lead[k]).trim();
  }
  return '';
}

function v2162AppendLead_(lead) {
  lead = lead || {};
  const sh = v2162GetSheet_();
  const now = new Date();

  const id = v2162Val_(lead, ['id','leadId','Mã lead']) || ('LD' + now.getTime());
  const name = v2162Val_(lead, ['name','ho_ten','hoten','Họ tên']);
  const phone = v2162Val_(lead, ['phone','sdt','tel','SĐT']);
  const email = v2162Val_(lead, ['email','Email']);
  const service = v2162Val_(lead, ['service','product','san_pham','Sản phẩm']);
  const income = v2162Val_(lead, ['income','thu_nhap','Thu nhập']);
  const need = v2162Val_(lead, ['need','nhu_cau','message','Nhu cầu']);
  const note = v2162Val_(lead, ['note','Ghi chú']);
  const source = v2162Val_(lead, ['source','Nguồn']) || v2162Val_(lead, ['utm_source']) || 'Direct';
  const url = v2162Val_(lead, ['sourcePage','url','URL']);

  sh.appendRow([
    id, now, name, phone, email, service, income, need, note,
    source,
    v2162Val_(lead, ['utm_source','Nguồn UTM']),
    v2162Val_(lead, ['utm_medium','Kênh UTM']),
    v2162Val_(lead, ['utm_campaign','Chiến dịch UTM']),
    v2162Val_(lead, ['utm_content','Nội dung UTM']),
    url,
    v2162Val_(lead, ['status','STATUS']) || 'D0 Mới',
    v2162Val_(lead, ['aiScore','AI_SCORE']),
    v2162Val_(lead, ['aiGrade','AI_GRADE']),
    v2162Val_(lead, ['aiTag','AI_TAG']),
    v2162Val_(lead, ['nextCall','NEXT_CALL']) || 'D1 Gọi',
    v2162Val_(lead, ['followupDay','FOLLOWUP_DAY']) || 'D1',
    v2162Val_(lead, ['productSuggest','PRODUCT_SUGGEST']) || service,
    v2162Val_(lead, ['timeline','TIMELINE']) || 'D0 Mới → D1 Gọi → D3 Nhắc → D7 Nuôi → D14 Chốt → Quá hạn',
    now
  ]);

  let mail_status = 'not_sent';
  let mail_error = '';

  try {
    const subject = 'Lead mới VayNhanh247 - ' + (name || phone || id);
    const body =
      'Lead mới từ VayNhanh247\n\n' +
      'Mã lead: ' + id + '\n' +
      'Thời gian: ' + now + '\n' +
      'Họ tên: ' + name + '\n' +
      'SĐT: ' + phone + '\n' +
      'Email: ' + email + '\n' +
      'Sản phẩm: ' + service + '\n' +
      'Thu nhập: ' + income + '\n' +
      'Nhu cầu: ' + need + '\n' +
      'Nguồn: ' + source + '\n' +
      'AI: ' + v2162Val_(lead, ['aiGrade','AI_GRADE']) + ' - ' + v2162Val_(lead, ['aiScore','AI_SCORE']) + ' - ' + v2162Val_(lead, ['aiTag','AI_TAG']) + '\n' +
      'URL: ' + url + '\n';
    MailApp.sendEmail(V2162_NOTIFY_EMAIL, subject, body);
    mail_status = 'sent';
  } catch (err) {
    mail_status = 'error';
    mail_error = String(err);
  }

  return {
    ok: true,
    id: id,
    row: sh.getLastRow(),
    email_to: V2162_NOTIFY_EMAIL,
    mail_status: mail_status,
    mail_error: mail_error
  };
}

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    let data = {};
    try { data = JSON.parse(raw); } catch (err) { data = {}; }
    const lead = data.lead || data;
    return v2162Json_(v2162AppendLead_(lead));
  } catch (err) {
    return v2162Json_({ ok:false, error:String(err), email_to:V2162_NOTIFY_EMAIL });
  }
}

function doGet(e) {
  return v2162Json_({
    ok:true,
    version:'V21.6.2_GMAIL_HOTFIX',
    email_to: V2162_NOTIFY_EMAIL,
    message:'Apps Script is running. POST creates lead and sends Gmail.'
  });
}

function testSendLeadEmail_V2162() {
  return v2162AppendLead_({
    id: 'TEST-' + new Date().getTime(),
    name: 'Test Gmail V21.6.2',
    phone: '0912345678',
    service: 'Vay tín chấp',
    income: '25 triệu',
    need: 'Test gửi Gmail từ Apps Script',
    source: 'Direct',
    aiScore: 78,
    aiGrade: 'A',
    aiTag: '🔥 A nóng',
    sourcePage: 'manual-test'
  });function sendLeadMail_(lead){
  const to = 'buingocthanh29@gmail.com';

  const name = lead.name || lead['Họ tên'] || '';
  const phone = lead.phone || lead.sdt || lead['SĐT'] || '';
  const service = lead.service || lead.product || lead['Sản phẩm'] || '';
  const income = lead.income || lead.thu_nhap || lead['Thu nhập'] || '';
  const need = lead.need || lead.nhu_cau || lead['Nhu cầu'] || '';
  const source = lead.source || lead.utm_source || lead['Nguồn'] || 'Direct';
  const score = lead.aiScore || lead.AI_SCORE || '';
  const grade = lead.aiGrade || lead.AI_GRADE || '';
  const tag = lead.aiTag || lead.AI_TAG || '';

  const subject = 'Lead mới VayNhanh247 - ' + (name || phone);

  const body =
    'Lead mới từ VayNhanh247\n\n' +
    'Họ tên: ' + name + '\n' +
    'SĐT: ' + phone + '\n' +
    'Sản phẩm: ' + service + '\n' +
    'Thu nhập: ' + income + '\n' +
    'Nhu cầu: ' + need + '\n' +
    'Nguồn: ' + source + '\n' +
    'AI: ' + grade + ' - ' + score + ' - ' + tag + '\n\n' +
    'Vào CRM để xử lý ngay.';

  MailApp.sendEmail(to, subject, body);
}
}
// ================= END V21_6_2_GMAIL_HOTFIX =================
