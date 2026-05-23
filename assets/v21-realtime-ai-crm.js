// V21 — web → GAS → Sheet → CRM → AI realtime
(function(){
const CFG=window.VAYNHANH247_CONFIG||{};
const GAS_URL=CFG.GAS_URL||'';
const CALL_PHONE=CFG.CALL_PHONE||'0822397836';
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cleanPhone(v){return String(v||'').replace(/\D/g,'')}
function scoreLead(lead){
 const text=[lead.need,lead.service,lead.income,lead.note,lead.utm_source,lead.url].join(' ').toLowerCase();
 let score=35;
 const income=Number(String(lead.income||'').replace(/\D/g,''))||0;
 if(income>=20000000)score+=25; else if(income>=10000000)score+=18; else if(income>=5000000)score+=10;
 if(/gấp|hôm nay|cần vay|muốn vay|giải ngân|làm hồ sơ/.test(text))score+=25;
 if(/cic|nợ xấu|nhóm 2|nhóm 3/.test(text))score+=12;
 if(/vay tín chấp|thẻ tín dụng|bảo hiểm|cic/.test(text))score+=8;
 if(/facebook|ads|utm/.test(text))score+=8;
 if(/seo|google|blog|organic/.test(text))score+=6;
 if(cleanPhone(lead.phone).length>=9)score+=10;
 if(/tham khảo|tìm hiểu|sau|chưa cần/.test(text))score-=18;
 score=Math.max(0,Math.min(100,score));
 const grade=score>=75?'A':score>=50?'B':'C';
 const tag=grade==='A'?'🔥 Nóng':grade==='B'?'🌤 Ấm':'❄ Lạnh';
 return {AI_SCORE:score,AI_GRADE:grade,AI_TAG:tag};
}
function suggestProduct(lead){
 const t=[lead.need,lead.service].join(' ').toLowerCase();
 if(/cic|nợ xấu|no xau|nhóm/.test(t))return 'Tư vấn CIC / nợ xấu';
 if(/thẻ|the tin dung|tín dụng|hạn mức/.test(t))return 'Tư vấn thẻ tín dụng';
 if(/bảo hiểm|bao hiem|nhân thọ|sức khỏe/.test(t))return 'Tư vấn bảo hiểm';
 return 'Tư vấn vay tín chấp';
}
function followup(grade){
 if(grade==='A')return {NEXT_CALL:'Gọi ngay trong 1 giờ',FOLLOWUP_DAY:'D1',TIMELINE:'D0 Lead mới → D1 Gọi → D3 Nhắc hồ sơ → D7 Cảnh báo mất lead'};
 if(grade==='B')return {NEXT_CALL:'Gọi trong 24 giờ',FOLLOWUP_DAY:'D3',TIMELINE:'D0 Lead mới → D1 Gọi → D3 Nhắc → D7 Nuôi lại'};
 return {NEXT_CALL:'Nuôi bằng SEO/FAQ',FOLLOWUP_DAY:'D7',TIMELINE:'D0 Lead mới → D3 Gửi FAQ → D7 Hỏi lại nhu cầu'};
}
function answer(q){
 q=String(q||'').toLowerCase();
 if(q.includes('cic'))return 'CIC là lịch sử tín dụng. Cần kiểm tra nhóm nợ, thời điểm tất toán và thu nhập hiện tại.';
 if(q.includes('nợ xấu')||q.includes('no xau'))return 'Nợ xấu có thể được tư vấn tùy nhóm nợ, thời gian tất toán và hồ sơ hiện tại.';
 if(q.includes('bảo hiểm')||q.includes('bao hiem')||q.includes('bhnt'))return 'Bảo hiểm nên chọn theo nhu cầu bảo vệ, ngân sách, độ tuổi và mục tiêu tài chính.';
 return 'Vay tín chấp cần xem thu nhập, CIC, nhu cầu vay và hồ sơ.';
}
async function sendRealtimeLead(lead){
 const ai=scoreLead(lead);
 const fu=followup(ai.AI_GRADE);
 lead.aiScore=ai.AI_SCORE;
 lead.aiGrade=ai.AI_GRADE;
 lead.aiTag=ai.AI_TAG;
 lead.productSuggest=suggestProduct(lead);
 lead.nextCall=fu.NEXT_CALL;
 lead.followupDay=fu.FOLLOWUP_DAY;
 lead.timeline=fu.TIMELINE;
 lead.status=lead.status||'Lead mới';
 lead.sourcePage=lead.sourcePage||'V21 realtime web';
 lead.url=location.href;
 const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'create',lead})});
 return await r.json();
}
function bindForms(){
 document.querySelectorAll('form').forEach(form=>{
  if(form.dataset.v21Bound)return; form.dataset.v21Bound='1';
  form.addEventListener('submit',async e=>{
   const hasPhone=[...form.querySelectorAll('input,textarea,select')].some(x=>/phone|sđt|sdt|điện thoại|so dien thoai/i.test(x.name+' '+x.id+' '+x.placeholder));
   if(!hasPhone)return;
   e.preventDefault();
   const fd=new FormData(form);
   const get=(keys)=>{for(const k of keys){let v=fd.get(k); if(v)return v} return ''};
   const inputs=[...form.querySelectorAll('input,textarea,select')];
   const valBy=(re)=>{const x=inputs.find(i=>re.test(i.name+' '+i.id+' '+i.placeholder+' '+(i.previousElementSibling?i.previousElementSibling.textContent:'')));return x?x.value:''};
   const lead={
    name:get(['name','hoten','ho_ten'])||valBy(/họ|ten|name/i),
    phone:get(['phone','sdt','so_dien_thoai'])||valBy(/sđt|sdt|phone|điện thoại/i),
    email:get(['email'])||valBy(/email/i),
    service:get(['service','product','san_pham'])||valBy(/sản phẩm|san pham|product/i),
    income:get(['income','thu_nhap'])||valBy(/thu nhập|thu nhap|income/i),
    need:get(['need','nhu_cau','message'])||valBy(/nhu cầu|nhu cau|message|ghi chú/i),
    note:'Lead form V21 realtime',
    utm_source:new URLSearchParams(location.search).get('utm_source')||'direct'
   };
   if(!lead.phone){alert('Vui lòng nhập SĐT để được tư vấn.');return}
   try{
    const res=await sendRealtimeLead(lead);
    if(res.ok){alert('Đã gửi thông tin. AI đã chấm điểm và lưu vào CRM.');form.reset();}
    else throw new Error(res.error||'Không gửi được lead');
   }catch(err){alert('Lỗi gửi lead: '+err.message)}
  }, true);
 });
}
function renderMiniAI(){
 if(document.getElementById('v21AiBox'))return;
 const div=document.createElement('div');
 div.id='v21AiBox';
 div.innerHTML=`<style>#v21AiBox{position:fixed;right:18px;bottom:92px;z-index:9999;font-family:Arial}#v21AiBtn{background:#0f172a;color:white;border:0;border-radius:999px;padding:14px 18px;font-weight:900;box-shadow:0 12px 30px #0003}#v21AiPanel{display:none;width:360px;max-width:calc(100vw - 30px);background:white;border:1px solid #dbe5e7;border-radius:20px;box-shadow:0 20px 60px #0003;overflow:hidden}#v21AiPanel header{background:#0f766e;color:white;padding:12px 14px;font-weight:900;display:flex;justify-content:space-between}#v21AiMsgs{max-height:240px;overflow:auto;padding:12px;background:#f8fafc}.m{padding:9px 11px;border-radius:12px;margin:7px 0}.b{background:white;border:1px solid #e2e8f0}.u{background:#d7faea;text-align:right}#v21AiPanel input,#v21AiPanel textarea{width:100%;padding:10px;border:1px solid #dbe5e7;border-radius:10px;margin-top:8px}#v21AiPanel button.send{width:100%;background:#0f766e;color:white;border:0;border-radius:10px;padding:11px;font-weight:900;margin-top:8px}</style><button id="v21AiBtn">🤖 AI V21</button><div id="v21AiPanel"><header>AI tư vấn V21 <button id="v21Close" style="background:transparent;color:white;border:0">×</button></header><div id="v21AiMsgs"><div class="m b">Hỏi về CIC, nợ xấu, bảo hiểm hoặc vay tín chấp. Nếu để SĐT, AI sẽ tạo lead realtime vào CRM.</div></div><div style="padding:12px"><textarea id="v21Need" placeholder="Nhu cầu..."></textarea><input id="v21Name" placeholder="Họ tên"><input id="v21Phone" placeholder="SĐT"><input id="v21Income" placeholder="Thu nhập/tháng"><button class="send" id="v21Send">Gửi tư vấn viên</button><p style="text-align:center"><a href="tel:${CALL_PHONE}">📞 Gọi ngay ${CALL_PHONE}</a></p></div></div>`;
 document.body.appendChild(div);
 document.getElementById('v21AiBtn').onclick=()=>document.getElementById('v21AiPanel').style.display='block';
 document.getElementById('v21Close').onclick=()=>document.getElementById('v21AiPanel').style.display='none';
 document.getElementById('v21Send').onclick=async()=>{
  const need=document.getElementById('v21Need').value;
  const name=document.getElementById('v21Name').value;
  const phone=document.getElementById('v21Phone').value;
  const income=document.getElementById('v21Income').value;
  const base={need,name,phone,income,service:suggestProduct({need}),note:'AI chat V21'};
  const ai=scoreLead(base), fu=followup(ai.AI_GRADE);
  document.getElementById('v21AiMsgs').innerHTML+=`<div class="m u">${esc(need)}</div><div class="m b">${esc(answer(need))}<br><b>AI:</b> ${ai.AI_GRADE} - ${ai.AI_TAG} (${ai.AI_SCORE}/100)<br><b>Gợi ý:</b> ${esc(suggestProduct(base))}<br><b>Lịch:</b> ${esc(fu.NEXT_CALL)}</div>`;
  if(!phone){alert('Nhập SĐT để tạo lead.');return}
  try{const res=await sendRealtimeLead(base); if(!res.ok)throw new Error(res.error||'Không gửi được'); alert('Đã lưu lead vào CRM realtime.')}catch(e){alert(e.message)}
 };
}
document.addEventListener('DOMContentLoaded',()=>{bindForms();renderMiniAI()});
window.V247_V21={scoreLead,suggestProduct,followup,answer,sendRealtimeLead};
})();
