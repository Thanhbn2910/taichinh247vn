/**
 * FinCare / taichinh247vn V14
 * CRM thật + AI chatbot qua OpenAI API + lưu hội thoại.
 * Cách set API key: Apps Script > Project Settings > Script properties
 * OPENAI_API_KEY = sk-...
 */
const SHEET_LEADS = 'Leads';
const SHEET_CHATS = 'Chats';
const LEAD_HEADERS = ['id','createdAt','updatedAt','name','phone','email','service','income','status','nextCall','note','source'];
const CHAT_HEADERS = ['id','createdAt','message','answer','source'];
function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    if(action === 'create') return json(createLead(body.lead || {}));
    if(action === 'list') return json({ok:true,data:listLeads()});
    if(action === 'update') return json(updateLead(body.id, body.patch || {}));
    if(action === 'chat') return json(chatAI(body.message || '', body.source || 'Website'));
    if(action === 'chats') return json({ok:true,data:listChats()});
    return json({ok:false,error:'Unknown action'});
  }catch(err){return json({ok:false,error:String(err)});}
}
function doGet(){return json({ok:true,data:{leads:listLeads(),chats:listChats()}});}
function getSheet(name, headers){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);
  if(sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}
function createLead(lead){
  const sh = getSheet(SHEET_LEADS, LEAD_HEADERS);
  const row = {
    id: lead.id || ('LD' + Date.now()),
    createdAt: lead.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: lead.name || '', phone: lead.phone || '', email: lead.email || '',
    service: lead.service || '', income: lead.income || '', status: lead.status || 'Mới',
    nextCall: lead.nextCall || '', note: lead.note || '', source: lead.source || ''
  };
  sh.appendRow(LEAD_HEADERS.map(h => row[h] || ''));
  return {ok:true,data:row};
}
function listLeads(){
  const sh = getSheet(SHEET_LEADS, LEAD_HEADERS); const values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  const heads = values[0];
  return values.slice(1).map(r => Object.fromEntries(heads.map((h,i)=>[h,r[i]]))).reverse();
}
function updateLead(id, patch){
  const sh = getSheet(SHEET_LEADS, LEAD_HEADERS); const values = sh.getDataRange().getValues(); const heads = values[0];
  const idCol = heads.indexOf('id');
  for(let i=1;i<values.length;i++){
    if(String(values[i][idCol]) === String(id)){
      Object.keys(patch).forEach(k=>{const c=heads.indexOf(k); if(c>=0) sh.getRange(i+1,c+1).setValue(patch[k]);});
      const u=heads.indexOf('updatedAt'); if(u>=0) sh.getRange(i+1,u+1).setValue(new Date().toISOString());
      return {ok:true,data:true};
    }
  }
  return {ok:false,error:'Lead not found'};
}
function chatAI(message, source){
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  let answer = '';
  if(apiKey){
    const prompt = 'Bạn là trợ lý tư vấn tài chính tiêu dùng tại Việt Nam cho website taichinh247vn. Trả lời ngắn, dễ hiểu, không cam kết duyệt vay, không yêu cầu thông tin nhạy cảm quá mức. Luôn gợi ý khách để lại số điện thoại nếu cần tư vấn. Câu hỏi khách: ' + message;
    const res = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions',{
      method:'post',contentType:'application/json',muteHttpExceptions:true,
      headers:{Authorization:'Bearer '+apiKey},
      payload:JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:prompt}],temperature:0.3,max_tokens:350})
    });
    const data = JSON.parse(res.getContentText());
    answer = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
  }
  if(!answer) answer = fallbackAnswer(message);
  saveChat(message, answer, source);
  return {ok:true,answer:answer};
}
function fallbackAnswer(message){
  const m = String(message).toLowerCase();
  if(m.indexOf('cic')>=0) return 'CIC cần kiểm tra nhóm nợ, thời gian tất toán và thu nhập hiện tại. Bạn để lại SĐT để được tư vấn hồ sơ phù hợp.';
  if(m.indexOf('lương')>=0 || m.indexOf('thu nhập')>=0) return 'Hạn mức vay phụ thuộc thu nhập, lịch sử tín dụng và hồ sơ làm việc. Bạn cho biết thu nhập/tháng, khoản muốn vay và SĐT nhé.';
  if(m.indexOf('thẻ')>=0) return 'Mở thẻ tín dụng thường cần CCCD, thu nhập ổn định hoặc lịch sử tín dụng tốt. Bạn muốn thẻ hoàn tiền hay miễn phí thường niên?';
  return 'G có thể tư vấn vay tín chấp, vay mua xe, thẻ tín dụng và bảo hiểm. Bạn mô tả nhu cầu và để lại SĐT để được hỗ trợ nhanh.';
}
function saveChat(message, answer, source){
  const sh = getSheet(SHEET_CHATS, CHAT_HEADERS);
  const row = {id:'CH'+Date.now(),createdAt:new Date().toISOString(),message:message,answer:answer,source:source};
  sh.appendRow(CHAT_HEADERS.map(h => row[h] || ''));
}
function listChats(){
  const sh = getSheet(SHEET_CHATS, CHAT_HEADERS); const values = sh.getDataRange().getValues();
  if(values.length < 2) return [];
  const heads = values[0];
  return values.slice(1).map(r => Object.fromEntries(heads.map((h,i)=>[h,r[i]]))).reverse();
}
function json(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
