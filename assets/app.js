
const CRM_CONFIG={
  GAS_URL:'', // Dán Web App URL Google Apps Script V18 vào đây sau khi deploy
  fallbackLocal:true,
  leadEmail:'buingocthanh29@gmail.com'
};

const PIPELINE=['Mới','Đã gọi','Quan tâm','Hồ sơ','Giải ngân','Hủy'];
const COMMISSION_BY_SERVICE={
  'Vay tín chấp':500000,
  'Thẻ tín dụng':250000,
  'Bảo hiểm':700000,
  'Tư vấn tài chính':300000,
  'CIC':200000,
  'Nợ xấu':250000,
  'Vay FE':450000,
  'Vay VPBank':500000
};

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function uid(){return 'LD'+Date.now().toString(36).toUpperCase()}
function now(){return new Date().toISOString()}
function qs(){return new URLSearchParams(location.search)}
function getUTM(){const q=qs(); return {utm_source:q.get('utm_source')||'',utm_medium:q.get('utm_medium')||'',utm_campaign:q.get('utm_campaign')||'',utm_content:q.get('utm_content')||'',utm_term:q.get('utm_term')||''}}
function getLeads(){return JSON.parse(localStorage.getItem('v18_real_leads')||'[]')}
function saveLeads(leads){localStorage.setItem('v18_real_leads',JSON.stringify(leads))}
function track(name,params={}){try{if(typeof gtag==='function')gtag('event',name,params)}catch(e){}}

async function crmApi(action,payload={}){
  if(CRM_CONFIG.GAS_URL){
    try{
      const r=await fetch(CRM_CONFIG.GAS_URL,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action,...payload})
      });
      const data=await r.json();
      if(data && data.ok) return data;
      console.warn('GAS returned non-ok, using local fallback',data);
    }catch(e){console.warn('GAS fallback',e)}
  }
  if(action==='create'){
    const leads=getLeads();
    const service=(payload.lead&&payload.lead.service)||'Tư vấn tài chính';
    const lead={id:uid(),createdAt:now(),status:'Mới',source:location.pathname,url:location.href,...getUTM(),...payload.lead,service};
    leads.unshift(lead); saveLeads(leads);
    return{ok:true,data:lead,local:true}
  }
  if(action==='list') return{ok:true,data:getLeads(),local:true}
  if(action==='update'){
    const leads=getLeads().map(x=>x.id===payload.id?{...x,...payload.patch,updatedAt:now()}:x);
    saveLeads(leads); return{ok:true,data:true,local:true}
  }
  if(action==='chat'){
    const msg=(payload.message||'').toLowerCase();
    let answer='G có thể tư vấn vay tín chấp, CIC, thẻ tín dụng, bảo hiểm và tài chính cá nhân. Bạn cho G biết nhu cầu và số điện thoại nhé.';
    if(msg.includes('cic')||msg.includes('nợ xấu')) answer='Bạn cần kiểm tra nhóm nợ, thời gian tất toán và hồ sơ hiện tại. Hãy để lại SĐT để được tư vấn hướng xử lý CIC/nợ xấu.';
    if(msg.includes('vay')) answer='Để gợi ý khoản vay, G cần biết thu nhập/tháng, số tiền muốn vay, hình thức nhận lương và tình trạng CIC.';
    if(msg.includes('fe')) answer='Vay FE cần xem thu nhập, lịch sử tín dụng và khả năng trả góp. Bạn nên để lại SĐT để được lọc hồ sơ trước.';
    if(msg.includes('vpbank')) answer='Vay VPBank/thẻ VPBank thường cần kiểm tra thu nhập, lịch sử tín dụng và hồ sơ hiện tại.';
    if(msg.includes('thẻ')) answer='Mở thẻ tín dụng nên xem thu nhập, phí thường niên, hạn mức và ưu đãi hoàn tiền/trả góp.';
    if(msg.includes('bảo hiểm')) answer='Bảo hiểm nên chọn theo mục tiêu: sức khỏe, tai nạn, tích lũy hoặc bảo vệ gia đình.';
    return{ok:true,answer,local:true}
  }
}

function normalizeLeadData(form){
  const data=Object.fromEntries(new FormData(form).entries());
  return {
    name:data.name||data.hoten||'',
    phone:data.phone||data.sdt||'',
    email:data.email||'',
    service:data.service||data.product||'Tư vấn tài chính',
    income:data.income||data.thunhap||'',
    need:data.need||data.note||data.nhucau||'',
    note:data.note||data.need||data.nhucau||'',
    sourcePage:document.title
  };
}

async function submitLead(form){
  const lead=normalizeLeadData(form);
  if(!lead.name || !lead.phone){alert('Vui lòng nhập họ tên và số điện thoại.');return}
  const btn=form.querySelector('button[type="submit"]'),old=btn?btn.textContent:'';
  if(btn){btn.textContent='Đang gửi...';btn.disabled=true}
  const res=await crmApi('create',{lead});
  track('submit_form',{service:lead.service,source:location.pathname});
  track('lead_created',{service:lead.service,local:!!res.local});
  if(btn){btn.textContent=old;btn.disabled=false}
  alert(res.local?'Đã lưu lead local. Sau khi dán GAS_URL, lead sẽ vào Google Sheet + Gmail.':'Đã nhận thông tin. G sẽ liên hệ tư vấn sớm!');
  form.reset();
}

function bindForms(){$$('form[data-lead], form').forEach(f=>{if(f.dataset.bound)return;f.dataset.bound='1';f.addEventListener('submit',e=>{e.preventDefault();submitLead(f)})})}

function chatInit(){
  const btn=$('#chatToggle'),box=$('#chatBox'),log=$('#chatLog'),input=$('#chatInput'),send=$('#chatSend');
  if(!btn||!box)return;
  btn.onclick=()=>{box.classList.toggle('hidden'); track('open_chat',{page:location.pathname})};
  async function sendMsg(){
    const msg=input.value.trim(); if(!msg)return;
    log.innerHTML+=`<div class="bubble user">${escapeHtml(msg)}</div>`; input.value='';
    track('chatbot_send',{page:location.pathname});
    const res=await crmApi('chat',{message:msg});
    log.innerHTML+=`<div class="bubble">${escapeHtml(res.answer||'G đã nhận câu hỏi.')}</div>`;
    log.scrollTop=log.scrollHeight;
  }
  send.onclick=sendMsg; input.addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg()});
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function bindTracking(){
  $$('a[href^="tel:"]').forEach(a=>a.addEventListener('click',()=>track('click_call',{href:a.href})));
  $$('a[href*="zalo"], a.zalo').forEach(a=>a.addEventListener('click',()=>track('click_zalo',{href:a.href})));
  if(location.pathname.includes('/posts/')) track('view_blog',{path:location.pathname,title:document.title});
}

function blogFilter(){
  const search=$('#postSearch'); const chips=$$('.chip'); const cards=$$('.post-card');
  if(!search)return;
  function apply(cat='all'){
    const q=search.value.toLowerCase();
    cards.forEach(c=>{
      const okText=c.innerText.toLowerCase().includes(q);
      const okCat=cat==='all'||c.dataset.cat===cat;
      c.style.display=(okText&&okCat)?'flex':'none';
    });
  }
  search.addEventListener('input',()=>apply(document.querySelector('.chip.active')?.dataset.cat||'all'));
  chips.forEach(ch=>ch.addEventListener('click',()=>{chips.forEach(x=>x.classList.remove('active'));ch.classList.add('active');apply(ch.dataset.cat)}));
}

async function loadAdmin(){
  const root=$('#adminRoot'); if(!root)return;
  const res=await crmApi('list'); const leads=res.data||[];
  const today=new Date().toISOString().slice(0,10);
  const todayCount=leads.filter(x=>(x.createdAt||'').slice(0,10)===today).length;
  const won=leads.filter(x=>x.status==='Giải ngân').length;
  const active=leads.filter(x=>!['Giải ngân','Hủy'].includes(x.status||'Mới')).length;
  const totalCommission=leads.filter(x=>x.status==='Giải ngân').reduce((s,l)=>s+(COMMISSION_BY_SERVICE[l.service]||300000),0);
  const expectedRevenue=leads.filter(x=>x.status!=='Hủy').reduce((s,l)=>s+(COMMISSION_BY_SERVICE[l.service]||300000),0);
  const conversion=leads.length?Math.round(won/leads.length*100):0;
  const pipelineHtml=PIPELINE.map(st=>{
    const count=leads.filter(x=>(x.status||'Mới')===st).length;
    return `<div class="kpi"><strong>${count}</strong><span>${st}</span></div>`;
  }).join('');
  const rows=leads.map(l=>`<tr>
    <td>${(l.createdAt||'').slice(0,10)}</td>
    <td><b>${escapeHtml(l.name||'')}</b><br><span class="muted">${escapeHtml(l.id||'')}</span></td>
    <td>${escapeHtml(l.phone||'')}</td>
    <td>${escapeHtml(l.email||'')}</td>
    <td>${escapeHtml(l.service||'')}</td>
    <td>${escapeHtml(l.income||'')}</td>
    <td>${escapeHtml(l.need||l.note||'')}</td>
    <td>${escapeHtml(l.utm_source||l.source||l.sourcePage||'')}</td>
    <td><select onchange="updateLeadStatus('${l.id}',this.value)">${PIPELINE.map(st=>`<option ${st===(l.status||'Mới')?'selected':''}>${st}</option>`).join('')}</select></td>
  </tr>`).join('');
  root.innerHTML=`
    <div class="kpi-row">
      <div class="kpi"><strong>${leads.length}</strong><span>Tổng lead</span></div>
      <div class="kpi"><strong>${todayCount}</strong><span>Lead hôm nay</span></div>
      <div class="kpi"><strong>${conversion}%</strong><span>Tỷ lệ chuyển đổi</span></div>
      <div class="kpi"><strong>${totalCommission.toLocaleString('vi-VN')}</strong><span>Hoa hồng đã chốt</span></div>
    </div>
    <div class="kpi-row">${pipelineHtml}</div>
    <div class="grid-2" style="margin-top:22px">
      <div class="card"><h2>Doanh thu dự kiến</h2><p class="lead">${expectedRevenue.toLocaleString('vi-VN')} đ</p><p class="muted">Tính theo hoa hồng giả lập từng sản phẩm.</p></div>
      <div class="card"><h2>Lead đang xử lý</h2><p class="lead">${active}</p><p class="muted">Không gồm Giải ngân và Hủy.</p></div>
    </div>
    <div class="card" style="margin-top:22px"><h2>Danh sách lead vận hành</h2><div class="table-wrap"><table class="admin-table"><thead><tr><th>Ngày</th><th>Khách</th><th>SĐT</th><th>Email</th><th>Sản phẩm</th><th>Thu nhập</th><th>Nhu cầu</th><th>Nguồn</th><th>Pipeline</th></tr></thead><tbody>${rows||'<tr><td colspan="9">Chưa có lead.</td></tr>'}</tbody></table></div></div>
  `;
}
async function updateLeadStatus(id,status){await crmApi('update',{id,patch:{status}});loadAdmin()}
window.updateLeadStatus=updateLeadStatus;

document.addEventListener('DOMContentLoaded',()=>{bindForms();chatInit();bindTracking();blogFilter();loadAdmin()});
