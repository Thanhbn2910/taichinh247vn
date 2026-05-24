// V21.5 Production: lead scoring + timeline + chat lead helper
(function(){
  const CALL_PHONE = "0822397836";

  function num(v){
    const s = String(v || '').toLowerCase().replace(/,/g,'.');
    const m = s.match(/(\d+(?:\.\d+)?)/);
    if(!m) return 0;
    let n = parseFloat(m[1]);
    if(s.includes('tr') || s.includes('triệu') || s.includes('trieu')) return n * 1000000;
    return n;
  }

  function scoreLead(lead){
    lead = lead || {};
    const text = JSON.stringify(lead).toLowerCase();
    let score = 30;
    const income = num(lead.income || lead['Thu nhập'] || lead.thu_nhap);
    if(income > 20000000) score += 20;
    if(text.includes('cic tốt') || text.includes('cic tot') || text.includes('nhóm 1') || text.includes('nhom 1')) score += 15;
    if(text.includes('vay tín chấp') || text.includes('vay tin chap')) score += 10;
    const phone = String(lead.phone || lead.sdt || lead['SĐT'] || '').replace(/\D/g,'');
    const need = String(lead.need || lead.nhu_cau || lead['Nhu cầu'] || '').trim();
    if(phone.length >= 9 && need.length >= 5) score += 10;
    if(text.includes('nợ xấu') || text.includes('no xau') || text.includes('nhóm 2') || text.includes('nhom 2')) score -= 15;
    if(text.includes('nhóm 3') || text.includes('nhom 3') || text.includes('nhóm 4') || text.includes('nhom 4') || text.includes('nhóm 5') || text.includes('nhom 5')) score -= 25;
    score = Math.max(0, Math.min(100, score));
    const grade = score >= 60 ? 'A' : score >= 35 ? 'B' : 'C';
    const tag = grade === 'A' ? '🔥 A nóng' : grade === 'B' ? '🌤 B trung bình' : '❄ C nuôi';
    return { score, grade, tag };
  }

  function buildTimeline(lead){
    const now = new Date();
    const d = days => {
      const x = new Date(now);
      x.setDate(x.getDate() + days);
      return x.toISOString().slice(0,10);
    };
    const status = String((lead && (lead.status || lead.STATUS)) || '').toLowerCase();
    const overdue = status.includes('quá hạn') || status.includes('qua han');
    return [
      {step:'D0 mới', date:d(0), color:'#0f766e', alert:false},
      {step:'D1 gọi', date:d(1), color:'#2563eb', alert:false},
      {step:'D3 nhắc', date:d(3), color:'#f59e0b', alert:false},
      {step:'D7 nuôi', date:d(7), color:'#64748b', alert:false},
      {step:'D14 đóng', date:d(14), color:'#334155', alert:false},
      {step:'Quá hạn', date: overdue ? d(0) : '', color:'#dc2626', alert:overdue}
    ];
  }

  function detectFromChat(text){
    text = String(text || '');
    const lower = text.toLowerCase();
    const incomeMatch = lower.match(/thu nhập\s*(?:khoảng|la|là)?\s*(\d+[\.,]?\d*)\s*(tr|triệu|trieu|m)?/);
    const phoneMatch = text.match(/(?:0|\+84)\d[\d\s.-]{7,12}/);
    let product = 'Vay tín chấp';
    if(lower.includes('thẻ') || lower.includes('tín dụng')) product = 'Thẻ tín dụng';
    if(lower.includes('bảo hiểm') || lower.includes('bhnt')) product = 'Bảo hiểm';
    if(lower.includes('cic') || lower.includes('nợ xấu') || lower.includes('no xau')) product = 'Tư vấn CIC / nợ xấu';
    return {
      name: 'Khách từ chat',
      phone: phoneMatch ? phoneMatch[0].replace(/\D/g,'').replace(/^84/,'0') : '',
      service: product,
      income: incomeMatch ? incomeMatch[1] + ' triệu' : '',
      need: text,
      note: 'Lead tạo từ chat V21.5 Production'
    };
  }

  async function createLeadFromChat(text){
    const lead = detectFromChat(text);
    const scoring = scoreLead(lead);
    lead.aiScore = scoring.score;
    lead.aiGrade = scoring.grade;
    lead.aiTag = scoring.tag;
    lead.timeline = JSON.stringify(buildTimeline(lead));
    if(!lead.phone) return {ok:false, missing:'phone', message:'Bạn cho thêm SĐT để tạo lead nhé.'};
    if(window.V247_V21 && window.V247_V21.sendRealtimeLead) return await window.V247_V21.sendRealtimeLead(lead);
    const cfg = window.VAYNHANH247_CONFIG || {};
    if(!cfg.GAS_URL) return {ok:false, message:'Chưa cấu hình GAS_URL.'};
    const r = await fetch(cfg.GAS_URL, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({action:'create', lead})});
    return await r.json();
  }

  window.V247_PRODUCTION = { scoreLead, buildTimeline, detectFromChat, createLeadFromChat };
})();
