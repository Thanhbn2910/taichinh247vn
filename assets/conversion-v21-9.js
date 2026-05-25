// V21.9.1 Layout Fix
(function(){

function v219IsLoginScreen(){
  const text=(document.body&&document.body.textContent||'').toLowerCase();
  return !!document.querySelector('input[type="password"]') && (text.includes('đăng nhập crm') || text.includes('đăng nhập'));
}

  const PHONE=(window.VAYNHANH247_CONFIG&&window.VAYNHANH247_CONFIG.CALL_PHONE)||'0822397836';

  function field(name,label,options){
    const el=document.createElement('label');
    el.className='field v219-field';
    if(options){
      el.innerHTML=label+'<select name="'+name+'">'+options.map(x=>'<option value="'+x+'">'+(x||'Chọn')+'</option>').join('')+'</select>';
    }else{
      el.innerHTML=label+'<input name="'+name+'" placeholder="'+label+'">';
    }
    return el;
  }

  function ensure(form,name,label,options){
    if(form.querySelector('[name="'+name+'"]')) return;
    const submit=form.querySelector('button[type="submit"],button.submit,input[type="submit"]');
    const f=field(name,label,options);
    if(submit&&submit.parentNode) submit.parentNode.insertBefore(f,submit);
    else form.appendChild(f);
  }

  function enhanceForms(){
    document.querySelectorAll('form').forEach(form=>{
      const isLead=form.id==='lead-form'||form.querySelector('[name="phone"],[name="sdt"],#phone,#sdt');
      if(!isLead) return;
      form.classList.add('v219-lead-form');

      if(!form.dataset.v219Fields){
        form.dataset.v219Fields='1';
        ensure(form,'job','Nghề nghiệp',['','Công nhân','Văn phòng','Kinh doanh tự do','Công chức/Giáo viên','Khác']);
        ensure(form,'cic_status','Tình trạng CIC',['','CIC tốt / nhóm 1','Nợ xấu nhóm 2','Nợ xấu nhóm 3','Đã tất toán nợ xấu','Chưa rõ']);
        ensure(form,'loan_purpose','Mục đích vay',['','Vay tiêu dùng','Trả nợ khoản cũ','Kinh doanh','Mở thẻ tín dụng','Khác']);
        ensure(form,'loan_amount','Số tiền cần');
        ensure(form,'province','Tỉnh/TP');
      }

      if(!form.nextElementSibling||!form.nextElementSibling.classList||!form.nextElementSibling.classList.contains('v219-form-cta')){
        const cta=document.createElement('div');
        cta.className='v219-form-cta';
        cta.innerHTML='<a class="v219-call" href="tel:'+PHONE+'">Gọi ngay '+PHONE+'</a><a class="v219-check" href="#lead-form">Kiểm tra hồ sơ</a><button type="button" class="v219-chat">Chat tư vấn</button>';
        form.insertAdjacentElement('afterend',cta);
      }
    });
  }

  function sticky(){
    if(document.getElementById('v219Sticky')) return;
    const div=document.createElement('div');
    div.id='v219Sticky';
    div.className='v219-sticky';
    div.innerHTML='<a class="v219-call" href="tel:'+PHONE+'">Gọi</a><a class="v219-check" href="#lead-form">Kiểm tra</a>';
    document.body.appendChild(div);
  }

  document.addEventListener('submit',function(e){
    const form=e.target;
    if(!form||!form.querySelector) return;
    const map={job:'Nghề nghiệp',cic_status:'Tình trạng CIC',loan_purpose:'Mục đích vay',loan_amount:'Số tiền cần',province:'Tỉnh/TP'};
    Object.keys(map).forEach(k=>{
      const el=form.querySelector('[name="'+k+'"]');
      if(el&&!form.querySelector('[name="'+map[k]+'"]')){
        const h=document.createElement('input');
        h.type='hidden';h.name=map[k];h.value=el.value;form.appendChild(h);
      }
    });
  },true);

  function crm(){
    if(!location.pathname.toLowerCase().includes('admin')) return;
    if(v219IsLoginScreen()){document.querySelectorAll('#v219Dash,.v219-dash').forEach(e=>e.remove());return;}
    if(!document.getElementById('v219Dash')){
      const dash=document.createElement('div');
      dash.id='v219Dash';dash.className='v219-dash';
      dash.innerHTML='<div class="v219-kpi"><b id="v219Lead">0</b><span>Lead</span></div><div class="v219-kpi"><b id="v219Called">0</b><span>Đã gọi</span></div><div class="v219-kpi"><b id="v219Hen">0</b><span>Hẹn</span></div><div class="v219-kpi"><b id="v219Chot">0</b><span>Chốt</span></div><div class="v219-kpi"><b id="v219Rate">0%</b><span>Tỷ lệ</span></div>';
      (document.querySelector('main')||document.body).prepend(dash);
    }
    updateCrm();
  }

  function updateCrm(){
    if(v219IsLoginScreen()){document.querySelectorAll('#v219Dash,.v219-dash').forEach(e=>e.remove());return;}
    const rows=[...document.querySelectorAll('table tbody tr')].filter(r=>!r.textContent.includes('Chưa có lead'));
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
    let called=0,hen=0,chot=0;
    rows.forEach(row=>{
      const txt=(row.textContent||'').toLowerCase();
      if(txt.includes('đã gọi')) called++;
      if(txt.includes('hẹn')) hen++;
      if(txt.includes('đủ hồ sơ')||txt.includes('chốt')) chot++;
      if(row.dataset.v219) return;
      row.dataset.v219='1';
      const box=document.createElement('div');
      box.innerHTML='<span class="v219-status-badge">Đã gọi</span><span class="v219-status-badge">Không nghe</span><span class="v219-status-badge">Hẹn gọi lại</span><span class="v219-status-badge">Đủ hồ sơ</span><span class="v219-status-badge">Không đạt</span>';
      const script=document.createElement('div');
      script.className='v219-script';
      script.innerHTML='<b>Kịch bản gọi:</b><br>• CIC đang nhóm mấy?<br>• Đã tất toán chưa?<br>• Thu nhập chuyển khoản hay tiền mặt?<br>• Mục đích vay?<br>• Số tiền cần?';
      if(row.children[0]){row.children[0].appendChild(box);row.children[0].appendChild(script);}
    });
    set('v219Lead',rows.length);set('v219Called',called);set('v219Hen',hen);set('v219Chot',chot);set('v219Rate',rows.length?Math.round(chot/rows.length*100)+'%':'0%');
  }

  document.addEventListener('DOMContentLoaded',()=>{enhanceForms();sticky();crm();});
  setTimeout(()=>{enhanceForms();sticky();crm();},800);
  setInterval(crm,3000);
})();
