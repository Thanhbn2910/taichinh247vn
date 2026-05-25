// V22.1.2 CRM Login Dashboard Fix
(function(){

function isAdminPage(){
  return location.pathname.toLowerCase().includes('admin');
}

function isLoginScreen(){
  const bodyText = (document.body && document.body.textContent || '').toLowerCase();
  const hasLoginText = bodyText.includes('đăng nhập crm') || bodyText.includes('đăng nhập');
  const hasPassword = !!document.querySelector('input[type="password"]');
  const hasLeadTable = !!document.querySelector('table tbody tr');
  return hasPassword && hasLoginText && !hasLeadTable;
}

function removeDashboardsOnLogin(){
  if(!isAdminPage()) return;
  if(!isLoginScreen()) return;
  document.querySelectorAll('#v22Dash,#v219Dash,.v22-grid,.v219-dash').forEach(el=>{
    const parent = el.closest('section,div') || el;
    parent.remove();
  });
}

function addDashboard(){
  if(!isAdminPage()) return;
  if(isLoginScreen()){
    removeDashboardsOnLogin();
    return;
  }

  // Remove duplicated old dashboards before adding single V22 dashboard
  document.querySelectorAll('#v219Dash,.v219-dash').forEach(el=>el.remove());
  document.querySelectorAll('#v22Dash').forEach((el,i)=>{ if(i>0) el.remove(); });

  if(document.getElementById('v22Dash')) return;

  const wrap=document.createElement('section');
  wrap.id='v22Dash';
  wrap.innerHTML=`
    <div class="v22-grid">
      <div class="v22-card"><b id="v22Lead">0</b><span>Lead</span></div>
      <div class="v22-card"><b id="v22Called">0</b><span>Đã gọi</span></div>
      <div class="v22-card"><b id="v22Hen">0</b><span>Hẹn</span></div>
      <div class="v22-card"><b id="v22Chot">0</b><span>Chốt</span></div>
      <div class="v22-card"><b id="v22Rate">0%</b><span>Tỷ lệ chốt</span></div>
    </div>
  `;
  const main = document.querySelector('main') || document.querySelector('.container') || document.body;
  main.prepend(wrap);
}

function updateDashboard(){
  if(!isAdminPage()) return;
  if(isLoginScreen()){
    removeDashboardsOnLogin();
    return;
  }

  addDashboard();

  const rows=[...document.querySelectorAll('table tbody tr')]
    .filter(r=>!r.textContent.includes('Chưa có lead') && r.children.length > 1);

  let called=0,hen=0,chot=0;

  rows.forEach(r=>{
    const txt=(r.textContent||'').toLowerCase();

    if(txt.includes('đã gọi')) called++;
    if(txt.includes('hẹn')) hen++;
    if(txt.includes('đủ hồ sơ')||txt.includes('chốt')) chot++;

    if(r.dataset.v22done) return;
    r.dataset.v22done='1';

    const script=document.createElement('div');
    script.className='v22-script';
    script.innerHTML=`
      <b>📞 Script gọi theo CIC</b><br>
      • CIC đang nhóm mấy?<br>
      • Đã tất toán chưa?<br>
      • Thu nhập chuyển khoản hay tiền mặt?<br>
      • Có hợp đồng lao động không?<br>
      • Đang cần vay bao nhiêu?<br>
      • Mục đích vay là gì?
    `;

    const status=document.createElement('div');
    status.className='v22-status';
    status.innerHTML=`
      <span>🔥 Gọi ngay</span>
      <span>📞 Đã gọi</span>
      <span>📅 Hẹn gọi lại</span>
      <span>✅ Đủ hồ sơ</span>
      <span>❌ Không đạt</span>
    `;

    if(r.children[0]){
      r.children[0].appendChild(status);
      r.children[0].appendChild(script);
    }
  });

  const total=rows.length;
  const rate=total?Math.round((chot/total)*100):0;

  const set=(id,val)=>{
    const el=document.getElementById(id);
    if(el) el.textContent=val;
  };

  set('v22Lead',total);
  set('v22Called',called);
  set('v22Hen',hen);
  set('v22Chot',chot);
  set('v22Rate',rate+'%');
}

function enhanceLeadForm(){
  if(isAdminPage()) return;
  document.querySelectorAll('form').forEach(form=>{
    const isLead=form.id==='lead-form'||form.querySelector('[name="phone"],[name="sdt"]');
    if(!isLead) return;

    if(form.dataset.v22) return;
    form.dataset.v22='1';

    const fields=[
      ['job','Nghề nghiệp'],
      ['income','Thu nhập'],
      ['cic','Tình trạng CIC'],
      ['purpose','Mục đích vay'],
      ['amount','Số tiền cần'],
      ['province','Tỉnh/TP']
    ];

    fields.forEach(([name,label])=>{
      if(form.querySelector('[name="'+name+'"]')) return;
      const input=document.createElement('input');
      input.name=name;
      input.placeholder=label;

      const submit=form.querySelector('button[type="submit"],input[type="submit"]');
      if(submit) form.insertBefore(input,submit);
      else form.appendChild(input);
    });
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  removeDashboardsOnLogin();
  addDashboard();
  updateDashboard();
  enhanceLeadForm();
});

setTimeout(()=>{removeDashboardsOnLogin();addDashboard();updateDashboard();},800);
setInterval(updateDashboard,3000);

})();
