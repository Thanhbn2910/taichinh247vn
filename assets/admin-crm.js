function cleanPhone_(v){return String(v || '').replace(/\D/g,'');}
/* V19.2 FINAL ADMIN CRM */
(function(){
const CFG = window.VAYNHANH247_CONFIG || {};
const GAS_URL = CFG.GAS_URL || '';
const ADMIN_USER = CFG.ADMIN_USER || 'thanhbn29';
const ADMIN_PASS = CFG.ADMIN_PASS || 'Thanh2509!';
const ZALO_PHONE = CFG.ZALO_PHONE || '0982821765';
const PIPELINE = ['Mới','Đã gọi','Quan tâm','Hồ sơ','Giải ngân','Hủy'];
const LEAD_TYPES = ['Nóng','Ấm','Lạnh'];

const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money = n => (Number(n)||0).toLocaleString('vi-VN') + ' đ';
const fmt = v => { if(!v) return ''; const d=new Date(v); return isNaN(d)?String(v):d.toLocaleString('vi-VN'); };
const qs = s => document.querySelector(s);

function isLogged(){ return sessionStorage.getItem('vay247_admin_logged') === '1'; }

window.adminLogin = function(){
  const u = qs('#adminUser').value.trim();
  const p = qs('#adminPass').value;
  if(u === ADMIN_USER && p === ADMIN_PASS){
    sessionStorage.setItem('vay247_admin_logged','1');
    loadCRM();
  }else{
    alert('Sai tài khoản hoặc mật khẩu.');
  }
};

window.adminLogout = function(){
  sessionStorage.removeItem('vay247_admin_logged');
  renderLogin();
};

function renderLogin(){
  document.body.innerHTML = `
  <section class="admin-login-page">
    <div class="login-card">
      <div class="brand-row"><span class="logo">V</span><div><b>VayNhanh247</b><small>Admin CRM V19.2</small></div></div>
      <h1>Đăng nhập Admin CRM</h1>
      <p>Chỉ quản trị viên mới xem được lead, Sheet, Gmail và pipeline chăm sóc khách.</p>
      <label>Tài khoản</label>
      <input id="adminUser" autocomplete="username" placeholder="Nhập tài khoản">
      <label>Mật khẩu</label>
      <input id="adminPass" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu">
      <button onclick="adminLogin()">Đăng nhập</button>
      <p class="hint">Tài khoản đã cấu hình: thanhbn29</p>
      <a href="index.html">← Về trang khách hàng</a>
    </div>
  </section>`;
}

async function api(action,payload={}){
  if(!GAS_URL) return {ok:false,data:[],error:'Chưa có GAS_URL'};
  try{
    const r = await fetch(GAS_URL,{
      method:'POST',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({action,...payload})
    });
    return await r.json();
  }catch(e){
    return {ok:false,data:[],error:String(e)};
  }
}

async function loadCRM(){
  document.body.innerHTML = `<main class="admin-shell"><h1>Đang tải CRM...</h1><p>Đang đọc lead từ Google Sheet thật...</p></main>`;
  const res = await api('list');
  if(!res.ok){
    document.body.innerHTML = `<main class="admin-shell"><h1>Không tải được CRM</h1><p>${esc(res.error||'Lỗi kết nối Google Apps Script')}</p><button onclick="adminLogout()">Đăng xuất</button></main>`;
    return;
  }
  window.LEADS = res.data || [];
  renderCRM();
}

function renderCRM(){
  const leads = window.LEADS || [];
  const today = new Date().toISOString().slice(0,10);
  const todayCount = leads.filter(l=>{
    const d=new Date(l.createdAt);
    return !isNaN(d) && d.toISOString().slice(0,10) === today;
  }).length;
  const won = leads.filter(l=>l.status==='Giải ngân').length;
  const conversion = leads.length ? Math.round(won/leads.length*100) : 0;
  const expected = leads.filter(l=>l.status!=='Hủy').reduce((s,l)=>s+(Number(l.expectedCommission)||0),0);

  document.body.innerHTML = `
  <header class="admin-header">
    <div class="brand-row"><span class="logo">V</span><div><b>VayNhanh247</b><small>CRM chạy thật từ Google Sheet</small></div></div>
    <nav><a href="index.html">Trang khách</a><a href="posts/index.html">Blog</a><button onclick="adminLogout()">Đăng xuất</button></nav>
  </header>
  <main class="admin-shell">
    <span class="badge">V19.2 Final</span>
    <h1>CRM vận hành lead thật</h1>
    <p class="lead">Lead chỉ xuất hiện khi khách gửi form đăng ký. CRM không tự sinh lead.</p>

    <div class="kpi-row">
      <div class="kpi"><strong>${leads.length}</strong><span>Tổng lead</span></div>
      <div class="kpi"><strong>${todayCount}</strong><span>Lead hôm nay</span></div>
      <div class="kpi"><strong>${conversion}%</strong><span>Tỷ lệ chốt</span></div>
      <div class="kpi"><strong>${money(expected)}</strong><span>Hoa hồng dự kiến</span></div>
    </div>

    <div class="toolbar">
      <input id="searchBox" placeholder="Tìm tên, SĐT, nhu cầu..." oninput="renderTable()">
      <select id="statusFilter" onchange="renderTable()"><option value="">Tất cả trạng thái</option>${PIPELINE.map(x=>`<option>${x}</option>`).join('')}</select>
      <select id="typeFilter" onchange="renderTable()"><option value="">Tất cả phân loại</option>${LEAD_TYPES.map(x=>`<option>${x}</option>`).join('')}</select>
      <button onclick="exportCSV()">Xuất CSV/Excel</button>
      <button onclick="loadCRM()">Tải lại</button>
    </div>

    <div class="pipeline-row">${PIPELINE.map(st=>`<button onclick="quickFilter('${st}')"><b>${leads.filter(l=>(l.status||'Mới')===st).length}</b><span>${st}</span></button>`).join('')}</div>

    <section class="grid-2">
      <div class="card"><h2>Lịch hẹn gọi lại</h2><div id="callbackList"></div></div>
      <div class="card"><h2>Ghi chú</h2><p>Gọi/Zalo khách, cập nhật pipeline và lịch hẹn. Mọi thay đổi lưu lại Google Sheet.</p></div>
    </section>

    <section class="card">
      <h2>Danh sách lead thật</h2>
      <div class="table-wrap"><table><thead><tr>
        <th>Khách</th><th>Sản phẩm/Nhu cầu</th><th>Pipeline</th><th>Phân loại</th><th>Lịch hẹn</th><th>Ghi chú chăm sóc</th><th>Thao tác</th>
      </tr></thead><tbody id="leadRows"></tbody></table></div>
    </section>
  </main>`;
  renderTable();
  renderCallbacks();
}

window.quickFilter = function(st){
  qs('#statusFilter').value = st;
  renderTable();
};

function filtered(){
  const q=(qs('#searchBox')?.value||'').toLowerCase();
  const st=qs('#statusFilter')?.value||'';
  const tp=qs('#typeFilter')?.value||'';
  return (window.LEADS||[]).filter(l=>{
    const text=[l.name,l.phone,l.email,l.service,l.need,l.careNote].join(' ').toLowerCase();
    return (!q||text.includes(q)) && (!st||(l.status||'Mới')===st) && (!tp||(l.leadType||'Ấm')===tp);
  });
}

window.renderTable = function(){
  const rows = filtered();
  qs('#leadRows').innerHTML = rows.map(l=>`
  <tr>
    <td><b>${esc(l.name)}</b><br><span>${esc(l.phone)}</span><br><small>${fmt(l.createdAt)}</small></td>
    <td><b>${esc(l.service)}</b><br>${esc(l.need||l.note)}<br><small>HH dự kiến: ${money(l.expectedCommission)}</small></td>
    <td><select onchange="saveLead('${esc(l.id)}','status',this.value)">${PIPELINE.map(st=>`<option ${st===(l.status||'Mới')?'selected':''}>${st}</option>`).join('')}</select></td>
    <td><select onchange="saveLead('${esc(l.id)}','leadType',this.value)">${LEAD_TYPES.map(t=>`<option ${t===(l.leadType||'Ấm')?'selected':''}>${t}</option>`).join('')}</select></td>
    <td><input type="datetime-local" value="${toLocal(l.callbackAt)}" onchange="saveLead('${esc(l.id)}','callbackAt',this.value)"></td>
    <td><textarea onchange="saveLead('${esc(l.id)}','careNote',this.value)" placeholder="Nhập ghi chú...">${esc(l.careNote||'')}</textarea></td>
    <td><a class="btn" href="tel:${esc(l.phone)}">Gọi ngay</a><a class="btn secondary" target="_blank" href="https://zalo.me/${esc(StringcleanPhone_(l.phone||ZALO_PHONE))}">Zalo</a></td>
  </tr>`).join('') || '<tr><td colspan="7">Chưa có lead. Lead chỉ hiển thị khi khách gửi form đăng ký.</td></tr>';
};

function toLocal(v){
  if(!v) return '';
  const d=new Date(v);
  if(isNaN(d)) return '';
  return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);
}

window.saveLead = async function(id,field,value){
  const l=(window.LEADS||[]).find(x=>x.id===id);
  if(l) l[field]=value;
  await api('update',{id,patch:{[field]:value}});
  renderCallbacks();
};

function renderCallbacks(){
  const list=(window.LEADS||[]).filter(l=>l.callbackAt).sort((a,b)=>new Date(a.callbackAt)-new Date(b.callbackAt)).slice(0,10);
  const el=qs('#callbackList');
  if(el) el.innerHTML = list.map(l=>`<p><b>${esc(l.name)}</b> — ${fmt(l.callbackAt)}<br><small>${esc(l.phone)} | ${esc(l.status)}</small></p>`).join('') || '<p>Chưa có lịch hẹn.</p>';
}

window.exportCSV = function(){
  const headers=['Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Nhu cầu','Trạng thái','Phân loại','Lịch hẹn','Ghi chú','Hoa hồng dự kiến'];
  const data=filtered().map(l=>[l.id,fmt(l.createdAt),l.name,l.phone,l.email,l.service,l.need,l.status,l.leadType,l.callbackAt,l.careNote,l.expectedCommission]);
  const csv=[headers,...data].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:'text/csv;charset=utf-8'}));
  a.download='VayNhanh247_Leads.csv';
  a.click();
};

document.addEventListener('DOMContentLoaded',()=> isLogged()?loadCRM():renderLogin());
})();
