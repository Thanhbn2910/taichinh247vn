
(function(){
const CFG=window.VAYNHANH247_CONFIG||{};
const GAS_URL=CFG.GAS_URL||'';
const CALL_PHONE=CFG.CALL_PHONE||'0822397836';
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function track(n,p){try{if(window.gtag)gtag('event',n,p||{})}catch(e){}}
function classify(text){
 text=String(text||'').toLowerCase();
 if(/cic|nợ xấu|no xau|nhóm 2|nhom 2|xóa nợ/.test(text)) return {service:'CIC / nợ xấu',reply:'Mình có thể kiểm tra sơ bộ CIC/nợ xấu. Bạn cho biết nhóm nợ, đã tất toán chưa và thu nhập hiện tại nhé.'};
 if(/thẻ|the tin dung|tín dụng|han muc|hạn mức/.test(text)) return {service:'Thẻ tín dụng',reply:'Mở thẻ phụ thuộc thu nhập, lịch sử tín dụng và hồ sơ. Bạn để SĐT để được tư vấn hạn mức phù hợp.'};
 if(/bảo hiểm|bao hiem|sức khỏe|nhân thọ/.test(text)) return {service:'Bảo hiểm',reply:'Mình có thể tư vấn sơ bộ nhóm bảo hiểm phù hợp theo nhu cầu và ngân sách.'};
 return {service:'Vay tín chấp',reply:'Bạn có thể được tư vấn vay theo thu nhập, CIC và nhu cầu vay. Bạn để lại SĐT để CRM gọi lại.'};
}
function scoreLead(lead){
 const text=[lead.need,lead.service,lead.income,lead.note].join(' ').toLowerCase();
 let score=40;
 if(/gấp|hôm nay|cần vay|muốn vay|giải ngân/.test(text)) score+=30;
 if(/cic|nợ xấu|nhóm 2|nhóm 3/.test(text)) score+=15;
 if(/lương|thu nhập|sao kê|chuyển khoản/.test(text)) score+=10;
 if(String(lead.phone||'').replace(/\D/g,'').length>=9) score+=10;
 if(/tham khảo|tìm hiểu|sau/.test(text)) score-=15;
 return {score:Math.max(0,Math.min(100,score)),type:score>=75?'Nóng':score>=45?'Ấm':'Lạnh'};
}
async function sendAILead(lead){
 const s=scoreLead(lead);
 lead.leadType=s.type;
 lead.note=(lead.note||'')+' | AI score: '+s.score;
 lead.sourcePage='AI tư vấn web';
 lead.utm_source='ai_chat';
 lead.url=location.href;
 track('ai_lead_created',{service:lead.service,lead_type:s.type});
 const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'create',lead})});
 return await r.json();
}
function render(){
 if(document.getElementById('aiLeadWidget')) return;
 const div=document.createElement('div');
 div.id='aiLeadWidget';
 div.innerHTML=`<style>
 #aiLeadWidget{position:fixed;right:18px;bottom:88px;z-index:120;font-family:Arial,sans-serif}
 #aiLeadButton{background:#0f172a;color:white;border:0;border-radius:999px;padding:14px 18px;font-weight:900;box-shadow:0 12px 30px rgba(0,0,0,.22);cursor:pointer}
 #aiLeadBox{display:none;width:360px;max-width:calc(100vw - 32px);background:white;border:1px solid #dbe5e7;border-radius:22px;box-shadow:0 20px 60px rgba(15,23,42,.22);overflow:hidden}
 #aiLeadBox header{background:#0f766e;color:white;padding:14px 16px;font-weight:900;display:flex;justify-content:space-between}
 #aiMsgs{padding:14px;max-height:260px;overflow:auto;background:#f8fafc}.ai-msg{padding:10px 12px;border-radius:14px;margin:8px 0;line-height:1.4}.bot{background:white;border:1px solid #e2e8f0}.user{background:#d7faea;text-align:right}
 #aiForm{padding:14px;display:grid;gap:8px}#aiForm input,#aiForm textarea{width:100%;padding:10px;border:1px solid #dbe5e7;border-radius:12px}#aiForm button{background:#0f766e;color:white;border:0;border-radius:12px;padding:11px;font-weight:900;cursor:pointer}
 @media(max-width:760px){#aiLeadWidget{right:10px;bottom:76px}#aiLeadBox{width:calc(100vw - 20px)}}
 </style><button id="aiLeadButton">🤖 AI tư vấn</button><div id="aiLeadBox"><header><span>AI tư vấn V20.5</span><button id="aiClose" style="background:transparent;color:white;border:0;font-size:18px">×</button></header><div id="aiMsgs"><div class="ai-msg bot">Bạn cần tư vấn vay tín chấp, CIC/nợ xấu, thẻ tín dụng hay bảo hiểm?</div></div><form id="aiForm"><textarea id="aiNeed" placeholder="Nhập nhu cầu..." required></textarea><input id="aiName" placeholder="Họ tên"><input id="aiPhone" placeholder="SĐT để tư vấn nhanh"><button type="submit">Gửi cho tư vấn viên</button><a href="tel:${CALL_PHONE}" style="text-align:center;color:#0f766e;font-weight:900">📞 Gọi ngay ${CALL_PHONE}</a></form></div>`;
 document.body.appendChild(div);
 document.getElementById('aiLeadButton').onclick=()=>{document.getElementById('aiLeadBox').style.display='block';track('open_ai_chat')};
 document.getElementById('aiClose').onclick=()=>document.getElementById('aiLeadBox').style.display='none';
 document.getElementById('aiForm').onsubmit=async(e)=>{
  e.preventDefault();
  const need=document.getElementById('aiNeed').value.trim();
  const name=document.getElementById('aiName').value.trim();
  const phone=document.getElementById('aiPhone').value.trim();
  const rule=classify(need);
  document.getElementById('aiMsgs').innerHTML+=`<div class="ai-msg user">${esc(need)}</div><div class="ai-msg bot">${esc(rule.reply)}</div>`;
  if(!phone){alert('Bạn nhập SĐT để tư vấn viên gọi lại nhé.');return;}
  try{const data=await sendAILead({name,phone,need,service:rule.service,income:'',note:'Lead tạo từ AI tư vấn'});if(data.ok){document.getElementById('aiMsgs').innerHTML+=`<div class="ai-msg bot">Đã chuyển thông tin vào CRM.</div>`;document.getElementById('aiForm').reset();}else throw new Error(data.error||'Không gửi được lead')}catch(err){alert('Chưa gửi được lead AI: '+err.message)}
 };
}
document.addEventListener('DOMContentLoaded',render);
window.V247ScoreLead=scoreLead;
})();
