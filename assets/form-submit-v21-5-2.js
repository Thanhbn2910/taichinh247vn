// V21.6.1 HOTFIX — safe form submit to GAS/Sheet/CRM/Gmail
(function(){
  function getConfig(){ return window.VAYNHANH247_CONFIG || {}; }
  function cleanPhone(v){ return String(v || '').replace(/\D/g, ''); }
  function makeLeadId(){ return 'LD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(); }
  function getValue(form, names){
    for (let i = 0; i < names.length; i++){
      const el = form.querySelector(`[name="${names[i]}"],#${names[i]}`);
      if (el) return el.value || '';
    }
    return '';
  }
  function toast(message, ok){
    let el = document.getElementById('v2161Toast');
    if (!el){
      el = document.createElement('div');
      el.id = 'v2161Toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:999999;background:#0f172a;color:#fff;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 12px 34px rgba(15,23,42,.25);max-width:92vw;text-align:center';
      document.body.appendChild(el);
    }
    el.style.background = ok ? '#0f766e' : '#dc2626';
    el.textContent = message;
    setTimeout(function(){ if(el && el.parentNode) el.parentNode.removeChild(el); }, 4500);
  }
  function parseIncome(v){
    const raw = String(v || '').toLowerCase().replace(/,/g, '.');
    const m = raw.match(/(\d+(?:\.\d+)?)/);
    if (!m) return 0;
    let n = parseFloat(m[1]);
    if (raw.includes('tr') || raw.includes('triệu') || raw.includes('trieu')) n *= 1000000;
    return n;
  }
  function scoreLead(lead){
    const text = JSON.stringify(lead || {}).toLowerCase();
    let score = 30;
    const income = parseIncome(lead.income || lead.thu_nhap || lead['Thu nhập']);
    if (income > 20000000) score += 20;
    if (text.includes('cic tốt') || text.includes('cic tot') || text.includes('nhóm 1') || text.includes('nhom 1')) score += 15;
    if (text.includes('vay tín chấp') || text.includes('vay tin chap')) score += 10;
    const phone = cleanPhone(lead.phone || lead.sdt || lead['SĐT']);
    const need = String(lead.need || lead.nhu_cau || lead['Nhu cầu'] || '').trim();
    if (phone.length >= 9 && need.length >= 5) score += 10;
    if (text.includes('nợ xấu') || text.includes('no xau') || text.includes('nhóm 2') || text.includes('nhom 2')) score -= 15;
    if (text.includes('nhóm 3') || text.includes('nhom 3') || text.includes('nhóm 4') || text.includes('nhom 4') || text.includes('nhóm 5') || text.includes('nhom 5')) score -= 25;
    score = Math.max(0, Math.min(100, score));
    let grade = 'C';
    if (score >= 60) grade = 'A';
    else if (score >= 35) grade = 'B';
    let tag = '❄ C nuôi';
    if (grade === 'A') tag = '🔥 A nóng';
    else if (grade === 'B') tag = '🌤 B trung bình';
    return { score: score, grade: grade, tag: tag };
  }
  function buildTimeline(){
    const now = new Date();
    function d(days){
      const x = new Date(now);
      x.setDate(x.getDate() + days);
      return x.toISOString().slice(0, 10);
    }
    return JSON.stringify([
      { step:'D0 mới', date:d(0), color:'#0f766e' },
      { step:'D1 gọi', date:d(1), color:'#2563eb' },
      { step:'D3 nhắc', date:d(3), color:'#f59e0b' },
      { step:'D7 nuôi', date:d(7), color:'#64748b' },
      { step:'D14 đóng', date:d(14), color:'#334155' },
      { step:'Quá hạn', date:'', color:'#dc2626' }
    ]);
  }
  function detectSource(){
    const path = location.pathname.toLowerCase();
    const qs = new URLSearchParams(location.search);
    const utm = String(qs.get('utm_source') || '').toLowerCase();
    const source = String(qs.get('source') || '').toLowerCase();
    if (utm.includes('google')) return 'Google SEO';
    if (path.includes('/landing/')) return 'Landing';
    if (path.includes('/posts/')) return 'Blog';
    if (source.includes('chat')) return 'Chatbot';
    return 'Direct';
  }
  function buildLead(form){
    let lead = {
      id: makeLeadId(),
      name: getValue(form, ['name', 'fullname', 'ho_ten', 'hoten']),
      phone: cleanPhone(getValue(form, ['phone', 'sdt', 'tel'])),
      email: getValue(form, ['email']),
      service: getValue(form, ['service', 'product', 'san_pham']),
      income: getValue(form, ['income', 'thu_nhap']),
      need: getValue(form, ['need', 'nhu_cau', 'message']),
      note: 'Lead form V21.6.1 submit hotfix',
      source: detectSource(),
      sourcePage: location.href,
      utm_source: new URLSearchParams(location.search).get('utm_source') || detectSource(),
      createdAt: new Date().toISOString(),
      status: 'D0 mới'
    };
    lead.thu_nhap = lead.income;
    lead['Thu nhập'] = lead.income;
    lead['SĐT'] = lead.phone;
    lead['Nhu cầu'] = lead.need;
    lead['Sản phẩm'] = lead.service;
    if (window.V247_LEAD_ENGINE_V216 && window.V247_LEAD_ENGINE_V216.enrichLead){
      lead = window.V247_LEAD_ENGINE_V216.enrichLead(lead);
    } else {
      const s = scoreLead(lead);
      lead.aiScore = s.score;
      lead.aiGrade = s.grade;
      lead.aiTag = s.tag;
      lead.timeline = buildTimeline();
      lead.nextCall = 'D1 gọi';
      lead.followupDay = 'D1';
    }
    return lead;
  }
  async function sendLead(lead){
    const GAS_URL = getConfig().GAS_URL;
    if (!GAS_URL) throw new Error('Thiếu GAS_URL trong assets/config.js');
    const payloads = [{ action:'create', lead: lead }, { action:'addLead', lead: lead }, lead];
    let lastError = null;
    for (let i = 0; i < payloads.length; i++){
      try{
        const res = await fetch(GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type':'text/plain;charset=utf-8' },
          body: JSON.stringify(payloads[i])
        });
        const text = await res.text();
        let data = {};
        try { data = JSON.parse(text); } catch(e){ data = { ok: res.ok, text: text }; }
        if (res.ok && data.ok !== false) return data;
        lastError = new Error(data.error || text || ('HTTP ' + res.status));
      } catch(err){ lastError = err; }
    }
    throw lastError || new Error('Không gửi được lead');
  }
  function hookForms(){
    const forms = Array.from(document.querySelectorAll('form'));
    forms.forEach(function(form){
      if (form.dataset.v2161Hooked) return;
      const hasLeadFields = form.id === 'lead-form' || form.querySelector('[name="phone"],[name="sdt"],#phone,#sdt');
      if (!hasLeadFields) return;
      form.dataset.v2161Hooked = '1';
      form.addEventListener('submit', async function(e){
        e.preventDefault();
        e.stopPropagation();
        const btn = form.querySelector('button[type="submit"],button.submit,input[type="submit"]');
        const oldText = btn ? (btn.textContent || btn.value || '') : '';
        try{
          const lead = buildLead(form);
          if (!lead.name) throw new Error('Vui lòng nhập họ tên');
          if (!lead.phone || lead.phone.length < 9) throw new Error('Vui lòng nhập số điện thoại hợp lệ');
          if (btn){
            btn.disabled = true;
            if (btn.tagName.toLowerCase() === 'input') btn.value = 'Đang gửi...';
            else btn.textContent = 'Đang gửi...';
          }
          const result = await sendLead(lead);
          console.log('V21.6.2 lead sent:', result, lead);
          toast('Đã gửi thông tin thành công. Lead đã chuyển về Sheet/CRM/Gmail.', true);
          form.reset();
        } catch(err){
          console.error('V21.6.1 submit error:', err);
          toast('Lỗi gửi lead: ' + (err && err.message ? err.message : err), false);
        } finally {
          if (btn){
            btn.disabled = false;
            if (btn.tagName.toLowerCase() === 'input') btn.value = oldText || 'Gửi thông tin';
            else btn.textContent = oldText || 'Nhận tư vấn miễn phí';
          }
        }
      }, true);
    });
  }
  document.addEventListener('DOMContentLoaded', hookForms);
  setTimeout(hookForms, 800);
  setTimeout(hookForms, 2000);
})();
