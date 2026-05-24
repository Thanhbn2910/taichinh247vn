// V21.5.2 HOTFIX — Web Form -> GAS -> Sheet/CRM/Gmail
(function(){
  function cfg(){ return window.VAYNHANH247_CONFIG || {}; }
  function cleanPhone(v){ return String(v||'').replace(/\D/g,''); }
  function leadId(){ return 'LD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase(); }
  function getValue(form, names){
    for(const name of names){
      const el = form.querySelector(`[name="${name}"],#${name}`);
      if(el) return el.value || '';
    }
    return '';
  }
  function toast(msg, ok){
    let el = document.getElementById('v2152Toast');
    if(!el){
      el = document.createElement('div');
      el.id = 'v2152Toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999999;background:#0f172a;color:#fff;padding:12px 16px;border-radius:14px;font-weight:800;box-shadow:0 12px 34px rgba(15,23,42,.25);max-width:90vw;text-align:center';
      document.body.appendChild(el);
    }
    el.style.background = ok ? '#0f766e' : '#dc2626';
    el.textContent = msg;
    setTimeout(()=>{el.remove()}, 4200);
  }
  function scoreLead(lead){
    const text = JSON.stringify(lead).toLowerCase();
    let score = 30;
    const incomeRaw = String(lead.income || '');
    let income = 0;
    const m = incomeRaw.match(/(\d+(?:[\.,]\d+)?)/);
    if(m){
      income = parseFloat(m[1].replace(',','.'));
      if(/tr|triệu|trieu/i.test(incomeRaw)) income *= 1000000;
    }
    if(income > 20000000) score += 20;
    if(text.includes('cic tốt') || text.includes('cic tot') || text.includes('nhóm 1') || text.includes('nhom 1')) score += 15;
    if(text.includes('vay tín chấp') || text.includes('vay tin chap')) score += 10;
    if(cleanPhone(lead.phone).length >= 9 && String(lead.need||'').length >= 5) score += 10;
    if(text.includes('nợ xấu') || text.includes('no xau') || text.includes('nhóm 2') || text.includes('nhom 2')) score -= 15;
    if(text.includes('nhóm 3') || text.includes('nhom 3') || text.includes('nhóm 4') || text.includes('nhom 4') || text.includes('nhóm 5') || text.includes('nhom 5')) score -= 25;
    score = Math.max(0, Math.min(100, score));
    const grade = score >= 60 ? 'A' : score >= 35 ? 'B' : 'C';
    const tag = grade === 'A' ? '🔥 A nóng' : grade === 'B' ? '🌤 B trung bình' : '❄ C nuôi';
    return {score, grade, tag};
  }
  function timeline(){
    const now = new Date();
    const d = days => {
      const x = new Date(now);
      x.setDate(x.getDate()+days);
      return x.toISOString().slice(0,10);
    };
    return JSON.stringify([
      {step:'D0 mới', date:d(0), color:'#0f766e'},
      {step:'D1 gọi', date:d(1), color:'#2563eb'},
      {step:'D3 nhắc', date:d(3), color:'#f59e0b'},
      {step:'D7 nuôi', date:d(7), color:'#64748b'},
      {step:'D14 đóng', date:d(14), color:'#334155'},
      {step:'Quá hạn', date:'', color:'#dc2626'}
    ]);
  }
  function buildLead(form){
    const lead = {
      id: leadId(),
      name: getValue(form, ['name','fullname','ho_ten','hoten']),
      phone: cleanPhone(getValue(form, ['phone','sdt','tel'])),
      email: getValue(form, ['email']),
      service: getValue(form, ['service','product','san_pham']),
      income: getValue(form, ['income','thu_nhap']),
      need: getValue(form, ['need','nhu_cau','message']),
      note: 'Lead form V21.5.2',
      sourcePage: location.href,
      utm_source: new URLSearchParams(location.search).get('utm_source') || 'website',
      createdAt: new Date().toISOString(),
      status: 'D0 mới'
    };
    const s = scoreLead(lead);
    lead.aiScore = s.score;
    lead.aiGrade = s.grade;
    lead.aiTag = s.tag;
    lead.thu_nhap = lead.income;
    lead['Thu nhập'] = lead.income;
    lead.timeline = timeline();
    return lead;
  }
  async function sendLead(lead){
    const GAS_URL = cfg().GAS_URL;
    if(!GAS_URL) throw new Error('Thiếu GAS_URL trong assets/config.js');
    const payloads = [
      { action:'create', lead },
      { action:'addLead', lead },
      lead
    ];
    let lastErr = null;
    for(const payload of payloads){
      try{
        const res = await fetch(GAS_URL, {
          method: 'POST',
          headers: {'Content-Type':'text/plain;charset=utf-8'},
          body: JSON.stringify(payload),
          mode: 'cors'
        });
        const text = await res.text();
        let data = {};
        try{ data = JSON.parse(text); }catch(e){ data = {ok: res.ok, text}; }
        if(res.ok && (data.ok !== false)) return data;
        lastErr = new Error(data.error || text || ('HTTP '+res.status));
      }catch(e){
        lastErr = e;
      }
    }
    throw lastErr || new Error('Không gửi được lead');
  }
  function hook(){
    const forms = Array.from(document.querySelectorAll('form'));
    forms.forEach(form=>{
      if(form.dataset.v2152Hooked) return;
      const hasLeadFields = form.querySelector('[name="phone"],[name="sdt"],#phone,#sdt') || form.id === 'lead-form';
      if(!hasLeadFields) return;
      form.dataset.v2152Hooked = '1';
      form.addEventListener('submit', async function(e){
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"],button.submit');
        const old = btn ? btn.textContent : '';
        try{
          const lead = buildLead(form);
          if(!lead.name) throw new Error('Vui lòng nhập họ tên');
          if(!lead.phone || lead.phone.length < 9) throw new Error('Vui lòng nhập số điện thoại hợp lệ');
          if(btn){ btn.disabled = true; btn.textContent = 'Đang gửi...'; }
          const data = await sendLead(lead);
          toast('Đã gửi thông tin thành công. Lead đã chuyển về Sheet/CRM/Gmail.', true);
          form.reset();
          console.log('V21.5.2 lead sent:', data);
        }catch(err){
          console.error('V21.5.2 submit error:', err);
          toast('Lỗi gửi lead: ' + err.message, false);
        }finally{
          if(btn){ btn.disabled = false; btn.textContent = old || 'Nhận tư vấn miễn phí'; }
        }
      }, true);
    });
  }
  document.addEventListener('DOMContentLoaded', hook);
  setTimeout(hook, 800);
})();
