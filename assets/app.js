
const CRM_CONFIG={GAS_URL:'',fallbackLocal:true};
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function uid(){return 'LD'+Date.now().toString(36).toUpperCase()}
function now(){return new Date().toISOString()}
function getLeads(){return JSON.parse(localStorage.getItem('v16_pro_leads')||'[]')}
function saveLeads(leads){localStorage.setItem('v16_pro_leads',JSON.stringify(leads))}
async function crmApi(action,payload={}){
 if(CRM_CONFIG.GAS_URL){try{const r=await fetch(CRM_CONFIG.GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});return await r.json()}catch(e){console.warn('GAS fallback',e)}}
 if(action==='create'){const leads=getLeads();const lead={id:uid(),createdAt:now(),status:'Mới',source:location.pathname,utm:location.search,...payload.lead};leads.unshift(lead);saveLeads(leads);return{ok:true,data:lead}}
 if(action==='list')return{ok:true,data:getLeads()}
 if(action==='chat'){const msg=(payload.message||'').toLowerCase();let answer='G có thể tư vấn vay tín chấp, CIC, thẻ tín dụng, bảo hiểm và tài chính cá nhân. Bạn cho G biết nhu cầu và số điện thoại nhé.';if(msg.includes('cic'))answer='CIC cần xem nhóm nợ, thời gian tất toán và hồ sơ hiện tại. Bạn có thể để lại SĐT để được tư vấn hướng phù hợp.';if(msg.includes('vay'))answer='Để gợi ý vay, G cần biết thu nhập/tháng, số tiền muốn vay, hình thức nhận lương và tình trạng CIC.';if(msg.includes('thẻ'))answer='Mở thẻ tín dụng nên xem thu nhập, phí thường niên, hạn mức và ưu đãi hoàn tiền/trả góp.';if(msg.includes('bảo hiểm'))answer='Bảo hiểm nên chọn theo mục tiêu: sức khỏe, tai nạn, tích lũy hoặc bảo vệ gia đình.';return{ok:true,answer}}
}
async function submitLead(form){const data=Object.fromEntries(new FormData(form).entries());const btn=form.querySelector('button[type="submit"]'),old=btn?btn.textContent:'';if(btn){btn.textContent='Đang gửi...';btn.disabled=true}await crmApi('create',{lead:data});if(btn){btn.textContent=old;btn.disabled=false}alert('Đã nhận thông tin. G sẽ liên hệ tư vấn sớm!');form.reset()}
function bindForms(){$$('form[data-lead]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();submitLead(f)}))}
function chatInit(){const btn=$('#chatToggle'),box=$('#chatBox'),log=$('#chatLog'),input=$('#chatInput'),send=$('#chatSend');if(!btn||!box)return;btn.onclick=()=>box.classList.toggle('hidden');async function sendMsg(){const msg=input.value.trim();if(!msg)return;log.innerHTML+=`<div class="bubble user">${msg}</div>`;input.value='';const res=await crmApi('chat',{message:msg});log.innerHTML+=`<div class="bubble">${res.answer||'G đã nhận câu hỏi.'}</div>`;log.scrollTop=log.scrollHeight}send.onclick=sendMsg;input.addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg()})}
function blogFilter(){const search=$('#postSearch'); const chips=$$('.chip'); const cards=$$('.post-card'); if(!search)return; function apply(cat='all'){const q=search.value.toLowerCase();cards.forEach(c=>{const okText=c.innerText.toLowerCase().includes(q); const okCat=cat==='all'||c.dataset.cat===cat; c.style.display=(okText&&okCat)?'flex':'none'});} search.addEventListener('input',()=>apply(document.querySelector('.chip.active')?.dataset.cat||'all')); chips.forEach(ch=>ch.addEventListener('click',()=>{chips.forEach(x=>x.classList.remove('active'));ch.classList.add('active');apply(ch.dataset.cat)}))}
document.addEventListener('DOMContentLoaded',()=>{bindForms();chatInit();blogFilter()});
