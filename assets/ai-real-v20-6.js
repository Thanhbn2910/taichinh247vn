/* V20.6 — AI vận hành thật */
(function(){
const CFG=window.VAYNHANH247_CONFIG||{};
const GAS_URL=CFG.GAS_URL||'';
const CALL_PHONE=CFG.CALL_PHONE||'0822397836';
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function track(n,p){try{if(window.gtag)gtag('event',n,p||{})}catch(e){}}
function productFAQ(text){
 text=String(text||'').toLowerCase();
 if(/cic|nợ xấu|no xau|nhóm 2|nhóm 3|xóa nợ/.test(text)){
  return {service:'CIC / nợ xấu', product:'Tư vấn kiểm tra CIC', reply:'Với CIC/nợ xấu, cần kiểm tra nhóm nợ, thời điểm tất toán, thu nhập hiện tại và sản phẩm phù hợp. Nếu bạn để SĐT, CRM sẽ chuyển tư vấn viên gọi kiểm tra hướng xử lý.'};
 }
 if(/thẻ|the tin dung|tín dụng|hạn mức|han muc/.test(text)){
  return {service:'Thẻ tín dụng', product:'Tư vấn mở thẻ tín dụng', reply:'Mở thẻ tín dụng phụ thuộc thu nhập, lịch sử tín dụng, nghề nghiệp và hồ sơ hiện có. AI sẽ chuyển bạn sang nhóm tư vấn thẻ để kiểm tra hạn mức.'};
 }
 if(/bảo hiểm|bao hiem|sức khỏe|nhân thọ|tai nạn/.test(text)){
  return {service:'Bảo hiểm', product:'Tư vấn bảo hiểm cá nhân', reply:'Bảo hiểm nên chọn theo mục tiêu bảo vệ, ngân sách và độ tuổi. AI sẽ ghi nhận nhu cầu để tư vấn viên gợi ý gói phù hợp.'};
 }
 return {service:'Vay tín chấp', product:'Tư vấn vay tín chấp', reply:'Vay tín chấp cần xem thu nhập, CIC, nhu cầu vay và hồ sơ. Nếu bạn cần nhanh, hãy để SĐT để được gọi kiểm tra miễn phí.'};
}
function aiLeadScore(lead){
 const text=[lead.need,lead.service,lead.income,lead.note,lead.utm_source,lead.sourcePage].join(' ').toLowerCase();
 let score=35;
 const incomeNumber=Number(String(lead.income||'').replace(/\D/g,''))||0;
 if(incomeNumber>=20000000) score+=25;
 else if(incomeNumber>=10000000) score+=18;
 else if(incomeNumber>=5000000) score+=10;
 if(/gấp|hôm nay|cần vay|muốn vay|giải ngân|làm hồ sơ/.test(text)) score+=25;
 if(/cic|nợ xấu|nhóm 2|nhóm 3/.test(text)) score+=10;
 if(/vay tín chấp|thẻ tín dụng|bảo hiểm|cic/.test(text)) score+=8;
 if(/facebook|ads|utm/.test(text)) score+=8;
 if(/seo|google|blog|organic/.test(text)) score+=6;
 if(String(lead.phone||'').replace(/\D/g,'').length>=9) score+=10;
 if(/tham khảo|tìm hiểu|sau|chưa cần/.test(text)) score-=18;
 score=Math.max(0,Math.min(100,score));
 const grade=score>=75?'A':score>=50?'B':'C';
 const temp=grade==='A'?'Nóng':grade==='B'?'Ấm':'Lạnh';
 return {score,grade,temp};
}
async function createLeadFromAI(lead){
 const s=aiLeadScore(lead);
 lead.aiScore=s.score; lead.aiGrade=s.grade; lead.leadType=s.temp;
 lead.note=(lead.note||'')+` | AI V20.6: ${s.grade}/${s.score}`;
 lead.utm_source=lead.utm_source||'ai_chat';
 lead.sourcePage='AI tư vấn web V20.6';
 lead.url=location.href;
 track('v20_6_ai_lead_submit',{grade:s.grade,service:lead.service});
 const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'create',lead})});
 return await r.json();
}
function renderAI(){
 if(document.getElementById('aiLeadWidget')) return;
 const div=document.createElement('div');
 div.id='aiLeadWidget';
 div.innerHTML=`<style>
 #aiLeadWidget{position:fixed;right:18px;bottom:88px;z-index:999;font-family:Arial,sans-serif}
 #aiLeadButton{background:#0f172a;color:white;border:0;border-radius:999px;padding:14px 18px;font-weight:900;box-shadow:0 12px 30px rgba(0,0,0,.22);cursor:pointer}
 #aiLeadBox{display:none;width:380px;max-width:calc(100vw - 32px);background:white;border:1px solid #dbe5e7;border-radius:22px;box-shadow:0 20px 60px rgba(15,23,42,.22);overflow:hidden}
 #aiLeadBox header{background:#0f766e;color:white;padding:14px 16px;font-weight:900;display:flex;justify-content:space-between}
 #aiMsgs{padding:14px;max-height:280px;overflow:auto;background:#f8fafc}.ai-msg{padding:10px 12px;border-radius:14px;margin:8px 0;line-height:1.4}.bot{background:white;border:1px solid #e2e8f0}.user{background:#d7faea;text-align:right}
 #aiForm{padding:14px;display:grid;gap:8px}#aiForm input,#aiForm textarea,#aiForm select{width:100%;padding:10px;border:1px solid #dbe5e7;border-radius:12px}#aiForm button{background:#0f766e;color:white;border:0;border-radius:12px;padding:11px;font-weight:900;cursor:pointer}
 </style><button id="aiLeadButton">🤖 AI tư vấn</button><div id="aiLeadBox"><header><span>AI tư vấn V20.6</span><button id="aiClose" style="background:transparent;color:white;border:0;font-size:18px">×</button></header><div id="aiMsgs"><div class="ai-msg bot">Bạn cần tư vấn CIC, nợ xấu, vay tín chấp, thẻ tín dụng hay bảo hiểm?</div></div><form id="aiForm"><textarea id="aiNeed" placeholder="Nhập nhu cầu..." required></textarea><input id="aiName" placeholder="Họ tên"><input id="aiPhone" placeholder="SĐT để tư vấn nhanh" required><input id="aiIncome" placeholder="Thu nhập/tháng, ví dụ: 15 triệu"><button type="submit">Gửi tư vấn viên</button><a href="tel:${CALL_PHONE}" style="text-align:center;color:#0f766e;font-weight:900">📞 Gọi ngay ${CALL_PHONE}</a></form></div>`;
 document.body.appendChild(div);
 document.getElementById('aiLeadButton').onclick=()=>{document.getElementById('aiLeadBox').style.display='block';track('v20_6_open_ai')};
 document.getElementById('aiClose').onclick=()=>document.getElementById('aiLeadBox').style.display='none';
 document.getElementById('aiForm').onsubmit=async(e)=>{
  e.preventDefault();
  const need=document.getElementById('aiNeed').value.trim();
  const name=document.getElementById('aiName').value.trim();
  const phone=document.getElementById('aiPhone').value.trim();
  const income=document.getElementById('aiIncome').value.trim();
  const faq=productFAQ(need);
  const score=aiLeadScore({need,service:faq.service,income,phone,note:''});
  document.getElementById('aiMsgs').innerHTML+=`<div class="ai-msg user">${esc(need)}</div><div class="ai-msg bot">${esc(faq.reply)}<br><b>AI đánh giá:</b> ${score.grade} - ${score.temp} (${score.score}/100)<br><b>Gợi ý:</b> ${esc(faq.product)}</div>`;
  try{
    const data=await createLeadFromAI({name,phone,income,need,service:faq.service,note:'Lead từ AI tư vấn V20.6'});
    if(data.ok){document.getElementById('aiMsgs').innerHTML+=`<div class="ai-msg bot">Đã gửi lead vào CRM. Bạn sẽ được liên hệ sớm.</div>`;document.getElementById('aiForm').reset();}
    else throw new Error(data.error||'Không gửi được lead');
  }catch(err){alert('Chưa gửi được lead AI: '+err.message)}
 };
}
document.addEventListener('DOMContentLoaded',renderAI);
window.V247AI={productFAQ,aiLeadScore};
})();
