function doGet(e){
  return ContentService
    .createTextOutput(JSON.stringify({ok:true,app:"VayNhanh247",version:"V19",status:"running"}))
    .setMimeType(ContentService.MimeType.JSON);
}

const SHEET_NAME = 'Leads';
const HEADERS = [
  'Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','Ghi chú',
  'Nguồn UTM','Kênh UTM','Chiến dịch UTM','Nội dung UTM','Từ khóa UTM','Trang nguồn','Liên kết',
  'Trạng thái','Ghi chú chăm sóc','Lịch hẹn gọi lại','Phân loại lead','Hoa hồng dự kiến','Cập nhật lần cuối'
];

function getLeadSheet_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh) sh = ss.insertSheet(SHEET_NAME);
  const firstRow = sh.getRange(1,1,1,HEADERS.length).getValues()[0];
  if(String(firstRow[0]).toLowerCase() !== 'mã lead'){
    sh.clear(); sh.appendRow(HEADERS);
  } else {
    const current = sh.getRange(1,1,1,Math.max(sh.getLastColumn(), HEADERS.length)).getValues()[0];
    HEADERS.forEach(function(h,i){ if(current[i] !== h) sh.getRange(1,i+1).setValue(h); });
  }
  return sh;
}

function doPost(e){
  try{
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const body = JSON.parse(raw);
    const action = body.action || 'create';
    if(action === 'list') return listLeads_();
    if(action === 'update') return updateLead_(body.id, body.patch || {});
    if(action === 'create') return createLead_(body.lead || body);
    return json_({ok:false,error:'Unknown action'});
  }catch(err){ return json_({ok:false,error:String(err)}); }
}

function createLead_(lead){
  const sh = getLeadSheet_();
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
  const leadType = lead.leadType || classifyLead_(need, income);
  const expectedCommission = estimateCommission_(service);
  sh.appendRow([
    id, createdAt, name, phone, email, service, income, need, note,
    lead.utm_source || '', lead.utm_medium || '', lead.utm_campaign || '', lead.utm_content || '', lead.utm_term || '',
    lead.sourcePage || lead.source || '', lead.url || '', status, '', '', leadType, expectedCommission, new Date()
  ]);
  MailApp.sendEmail({
    to:'buingocthanh29@gmail.com',
    subject:'Lead mới VayNhanh247 - ' + service,
    htmlBody:'<h2>LEAD MỚI VAYNHANH247</h2>' +
      '<p><b>Mã lead:</b> '+id+'</p><p><b>Họ tên:</b> '+name+'</p><p><b>SĐT:</b> '+phone+'</p>' +
      '<p><b>Email:</b> '+email+'</p><p><b>Sản phẩm:</b> '+service+'</p><p><b>Thu nhập:</b> '+income+'</p>' +
      '<p><b>Nhu cầu:</b> '+need+'</p><p><b>Phân loại:</b> '+leadType+'</p>'
  });
  return json_({ok:true,data:{id:id,name:name,phone:phone,service:service,status:status,leadType:leadType}});
}

function listLeads_(){
  const sh = getLeadSheet_();
  const values = sh.getDataRange().getValues();
  if(values.length <= 1) return json_({ok:true,data:[]});
  const headers = values[0];
  const data = values.slice(1).filter(r => r.join('').trim() !== '').map(function(row){
    const o={}; headers.forEach((h,i)=>o[h]=row[i]);
    return {
      id:o['Mã lead']||'', createdAt:o['Thời gian']||'', name:o['Họ tên']||'', phone:o['SĐT']||'', email:o['Email']||'',
      service:o['Sản phẩm']||'', income:o['Thu nhập']||'', need:o['Nhu cầu']||'', note:o['Ghi chú']||'',
      utm_source:o['Nguồn UTM']||'', sourcePage:o['Trang nguồn']||'', url:o['Liên kết']||'',
      status:o['Trạng thái']||'Mới', careNote:o['Ghi chú chăm sóc']||'', callbackAt:o['Lịch hẹn gọi lại']||'',
      leadType:o['Phân loại lead']||'Ấm', expectedCommission:Number(o['Hoa hồng dự kiến'])||0, updatedAt:o['Cập nhật lần cuối']||''
    };
  }).reverse();
  return json_({ok:true,data:data});
}

function updateLead_(id, patch){
  const sh = getLeadSheet_();
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf('Mã lead') + 1;
  for(let r=2; r<=values.length; r++){
    if(String(sh.getRange(r,idCol).getValue()) === String(id)){
      setByHeader_(sh,headers,r,'Trạng thái',patch.status);
      setByHeader_(sh,headers,r,'Ghi chú chăm sóc',patch.careNote);
      setByHeader_(sh,headers,r,'Lịch hẹn gọi lại',patch.callbackAt);
      setByHeader_(sh,headers,r,'Phân loại lead',patch.leadType);
      setByHeader_(sh,headers,r,'Hoa hồng dự kiến',patch.expectedCommission);
      setByHeader_(sh,headers,r,'Cập nhật lần cuối',new Date());
      return json_({ok:true});
    }
  }
  return json_({ok:false,error:'Lead not found'});
}

function setByHeader_(sh,headers,row,header,value){
  if(typeof value === 'undefined') return;
  const col = headers.indexOf(header)+1;
  if(col>0) sh.getRange(row,col).setValue(value);
}
function estimateCommission_(service){
  service=String(service||'').toLowerCase();
  if(service.indexOf('bảo hiểm')>=0) return 700000;
  if(service.indexOf('thẻ')>=0) return 250000;
  if(service.indexOf('vpbank')>=0) return 500000;
  if(service.indexOf('fe')>=0) return 450000;
  if(service.indexOf('cic')>=0 || service.indexOf('nợ xấu')>=0) return 250000;
  if(service.indexOf('vay')>=0) return 500000;
  return 300000;
}
function classifyLead_(need,income){
  const s = String(need+' '+income).toLowerCase();
  if(s.indexOf('gấp')>=0 || s.indexOf('hôm nay')>=0 || s.indexOf('cần vay')>=0) return 'Nóng';
  if(s.indexOf('tham khảo')>=0 || s.indexOf('tìm hiểu')>=0) return 'Lạnh';
  return 'Ấm';
}
function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
