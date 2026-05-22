/* V18.8 CRM Pro */
const CRM_CONFIG = window.VAYNHANH247_CONFIG || {};
const GAS_URL = CRM_CONFIG.GAS_URL || '';
const ADMIN_USER = CRM_CONFIG.ADMIN_USER || 'admin';
const ADMIN_PASS = CRM_CONFIG.ADMIN_PASS || 'vay2472026';
const ZALO_PHONE = CRM_CONFIG.ZALO_PHONE || '0982821765';
const PIPELINE = ['Mới','Đã gọi','Quan tâm','Hồ sơ','Giải ngân','Hủy'];

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate = v => {
  if(!v) return '';
  const d = new Date(v);
  return isNaN(d) ? String(v) : d.toLocaleString('vi-VN');
};
const money = n => (Number(n)||0).toLocaleString('vi-VN') + ' đ';

function isLogged(){ return sessionStorage.getItem('vay247_admin_login') === '1'; }
function login(){
  const u = $('#adminUser').value.trim();
  const p = $('#adminPass').value.trim();
  if(u === ADMIN_USER && p === ADMIN_PASS){
    sessionStorage.setItem('vay247_admin_login','1');
    renderApp();
  } else alert('Sai tài khoản hoặc mật khẩu.');
}
function logout(){ sessionStorage.removeItem('vay247_admin_login'); location.reload(); }

async function api(action, payload={}){
  if(GAS_URL){
    try{
      const r = await fetch(GAS_URL, {
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body: JSON.stringify({action, ...payload})
      });
      const data = await r.json();
      if(data.ok) return data;
      console.warn(data);
    }catch(e){ console.warn('GAS error', e); }
  }
  // fallback local
  const leads = JSON.parse(localStorage.getItem('v18_real_leads')||'[]');
  if(action==='list') return {ok:true, data:leads};
  if(action==='update'){
    const next = leads.map(x => x.id === payload.id ? {...x, ...payload.patch, updatedAt:new Date().toISOString()} : x);
    localStorage.setItem('v18_real_leads', JSON.stringify(next));
    return {ok:true};
  }
  return {ok:false, data:[]};
}

function renderLogin(){
  $('#app').innerHTML = `
    <section class="section">
      <div class="container login-wrap">
        <div class="card login-card">
          <span class="badge">Admin bảo mật</span>
          <h1>Đăng nhập CRM</h1>
          <p class="muted">Chỉ quản trị viên mới xem được danh sách lead, pipeline và doanh thu dự kiến.</p>
          <label>Tài khoản</label>
          <input id="adminUser" value="admin" autocomplete="username">
          <label>Mật khẩu</label>
          <input id="adminPass" type="password" placeholder="Nhập mật khẩu">
          <button class="btn" onclick="login()">Đăng nhập</button>
          <p class="muted small">Mặc định: admin / vay2472026. Nên đổi trong assets/config.js khi chạy thật.</p>
        </div>
      </div>
    </section>`;
}

async function renderApp(){
  $('#app').innerHTML = `<section class="section"><div class="container"><h1>Đang tải CRM...</h1></div></section>`;
  const res = await api('list');
  window.LEADS = res.data || [];
  renderDashboard(window.LEADS);
}

function renderDashboard(leads){
  const today = new Date().toISOString().slice(0,10);
  const todayCount = leads.filter(l => new Date(l.createdAt).toISOString().slice(0,10) === today).length;
  const won = leads.filter(l => l.status === 'Giải ngân').length;
  const active = leads.filter(l => !['Giải ngân','Hủy'].includes(l.status || 'Mới')).length;
  const totalCommission = leads.filter(l => l.status === 'Giải ngân').reduce((s,l)=>s+(Number(l.expectedCommission)||0),0);
  const expectedCommission = leads.filter(l => l.status !== 'Hủy').reduce((s,l)=>s+(Number(l.expectedCommission)||0),0);
  const conversion = leads.length ? Math.round(won / leads.length * 100) : 0;

  const sourceMap = {};
  leads.forEach(l => {
    const s = l.utm_source || l.sourcePage || 'Không rõ';
    sourceMap[s] = (sourceMap[s] || 0) + 1;
  });

  $('#app').innerHTML = `
  <header class="header">
    <div class="container nav">
      <a class="brand" href="index.html"><span class="logo">V</span><span>VayNhanh247<small>CRM Pro V18.8</small></span></a>
      <nav class="menu"><a href="index.html">Trang chủ</a><a href="posts/index.html">Blog</a><a class="admin-link active">Admin CRM</a><button class="btn small" onclick="logout()">Đăng xuất</button></nav>
    </div>
  </header>
  <section class="section">
    <div class="container">
      <span class="badge">V18.8 CRM vận hành chuyên nghiệp</span>
      <h1>CRM quản lý lead & pipeline</h1>
      <p class="lead">Gọi nhanh, Zalo, ghi chú chăm sóc, lọc trạng thái, xuất CSV và theo dõi hoa hồng dự kiến.</p>

      <div class="kpi-row">
        <div class="kpi"><strong>${leads.length}</strong><span>Tổng lead</span></div>
        <div class="kpi"><strong>${todayCount}</strong><span>Lead hôm nay</span></div>
        <div class="kpi"><strong>${conversion}%</strong><span>Tỷ lệ chốt</span></div>
        <div class="kpi"><strong>${money(expectedCommission)}</strong><span>Hoa hồng dự kiến</span></div>
        <div class="kpi"><strong>${money(totalCommission)}</strong><span>Hoa hồng đã chốt</span></div>
        <div class="kpi"><strong>${active}</strong><span>Đang xử lý</span></div>
      </div>

      <div class="kpi-row pipeline-row">
        ${PIPELINE.map(st => `<button class="kpi pipeline-btn" onclick="setStatusFilter('${st}')"><strong>${leads.filter(l=>(l.status||'Mới')===st).length}</strong><span>${st}</span></button>`).join('')}
      </div>

      <div class="card crm-toolbar">
        <input id="q" placeholder="Tìm tên, SĐT, nhu cầu..." oninput="renderTable()">
        <select id="statusFilter" onchange="renderTable()">
          <option value="">Tất cả trạng thái</option>
          ${PIPELINE.map(st=>`<option>${st}</option>`).join('')}
        </select>
        <button class="btn secondary" onclick="exportCSV()">Xuất CSV/Excel</button>
        <button class="btn secondary" onclick="renderApp()">Tải lại lead</button>
      </div>

      <div class="grid-2">
        <div class="card"><h2>Lead theo nguồn</h2>${Object.entries(sourceMap).map(([k,v])=>`<p><b>${esc(k)}</b>: ${v}</p>`).join('') || '<p>Chưa có dữ liệu nguồn.</p>'}</div>
        <div class="card"><h2>Hướng dẫn</h2><p>Bấm Gọi/Zalo để chăm sóc khách. Cập nhật trạng thái và ghi chú ngay trên từng dòng.</p></div>
      </div>

      <div class="card" style="margin-top:22px">
        <h2>Danh sách lead</h2>
        <div class="table-wrap"><table class="admin-table"><thead><tr>
          <th>Thời gian</th><th>Khách hàng</th><th>Sản phẩm</th><th>Nhu cầu</th><th>Nguồn</th><th>Pipeline</th><th>Ghi chú chăm sóc</th><th>Thao tác</th>
        </tr></thead><tbody id="leadRows"></tbody></table></div>
      </div>
    </div>
  </section>`;
  renderTable();
}

function setStatusFilter(st){ $('#statusFilter').value = st; renderTable(); }

function filteredLeads(){
  const q = ($('#q')?.value || '').toLowerCase();
  const st = $('#statusFilter')?.value || '';
  return (window.LEADS || []).filter(l => {
    const blob = [l.name,l.phone,l.email,l.service,l.need,l.note,l.sourcePage,l.utm_source].join(' ').toLowerCase();
    return (!q || blob.includes(q)) && (!st || (l.status || 'Mới') === st);
  });
}

function renderTable(){
  const rows = filteredLeads();
  $('#leadRows').innerHTML = rows.map(l => `
    <tr>
      <td>${fmtDate(l.createdAt)}</td>
      <td><b>${esc(l.name)}</b><br><span class="muted">${esc(l.phone)}</span><br><span class="muted">${esc(l.email)}</span></td>
      <td>${esc(l.service)}<br><span class="muted">HH dự kiến: ${money(l.expectedCommission)}</span></td>
      <td>${esc(l.need || l.note)}</td>
      <td>${esc(l.utm_source || l.sourcePage || 'Không rõ')}</td>
      <td><select onchange="saveLead('${esc(l.id)}','status',this.value)">${PIPELINE.map(st=>`<option ${st===(l.status||'Mới')?'selected':''}>${st}</option>`).join('')}</select></td>
      <td><textarea onchange="saveLead('${esc(l.id)}','careNote',this.value)" placeholder="Nhập ghi chú chăm sóc...">${esc(l.careNote || '')}</textarea></td>
      <td class="actions-cell">
        <a class="btn small" href="tel:${esc(l.phone)}">Gọi ngay</a>
        <a class="btn small secondary" target="_blank" href="https://zalo.me/${esc((l.phone||ZALO_PHONE).replace(/[^0-9]/g,''))}">Zalo</a>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="8">Chưa có lead phù hợp.</td></tr>';
}

async function saveLead(id, field, value){
  const lead = (window.LEADS || []).find(l => l.id === id);
  if(lead) lead[field] = value;
  await api('update', {id, patch:{[field]:value}});
  renderDashboard(window.LEADS);
}

function exportCSV(){
  const rows = filteredLeads();
  const headers = ['Mã lead','Thời gian','Họ tên','SĐT','Email','Sản phẩm','Thu nhập','Nhu cầu','Nguồn','Trạng thái','Ghi chú chăm sóc','Hoa hồng dự kiến'];
  const data = rows.map(l => [l.id,fmtDate(l.createdAt),l.name,l.phone,l.email,l.service,l.income,l.need,l.utm_source||l.sourcePage,l.status,l.careNote,l.expectedCommission]);
  const csv = [headers,...data].map(r => r.map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(["\ufeff"+csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'VayNhanh247_Leads.csv';
  a.click();
}

function init(){ isLogged() ? renderApp() : renderLogin(); }
document.addEventListener('DOMContentLoaded', init);
