// V21.6 REAL FULL - SEO lead engine
(function(){
  const SOURCES = ['Google SEO','Landing','Blog','Chatbot','Direct'];
  function qp(name){ return new URLSearchParams(location.search).get(name) || ''; }
  function detectSource(){
    const path = location.pathname.toLowerCase();
    const utm = (qp('utm_source') || '').toLowerCase();
    if(utm.includes('google')) return 'Google SEO';
    if(path.includes('/landing/')) return 'Landing';
    if(path.includes('/posts/')) return 'Blog';
    if(qp('source').toLowerCase().includes('chat')) return 'Chatbot';
    return 'Direct';
  }
  function normalizeIncome(v){
    const s=String(v||'').toLowerCase().replace(/,/g,'.');
    const m=s.match(/(\d+(?:\.\d+)?)/);
    if(!m) return 0;
    let n=parseFloat(m[1]);
    if(s.includes('tr')||s.includes('triệu')||s.includes('trieu')) n*=1000000;
    return n;
  }
  function scoreLead(inputLead){
    let lead = inputLead || {};
    const text=JSON.stringify(lead).toLowerCase();
    let score=30;
    const income=normalizeIncome(lead.income||lead.thu_nhap||lead['Thu nhập']);
    if(income>20000000) score+=20;
    if(text.includes('cic tốt')||text.includes('cic tot')||text.includes('nhóm 1')||text.includes('nhom 1')) score+=15;
    if(text.includes('vay tín chấp')||text.includes('vay tin chap')) score+=10;
    const phone=String(lead.phone||lead.sdt||lead['SĐT']||'').replace(/\D/g,'');
    const need=String(lead.need||lead.nhu_cau||lead['Nhu cầu']||'').trim();
    if(phone.length>=9 && need.length>=5) score+=10;
    if(text.includes('nợ xấu')||text.includes('no xau')||text.includes('nhóm 2')||text.includes('nhom 2')) score-=15;
    if(text.includes('nhóm 3')||text.includes('nhom 3')||text.includes('nhóm 4')||text.includes('nhom 4')||text.includes('nhóm 5')||text.includes('nhom 5')) score-=25;
    score=Math.max(0,Math.min(100,score));
    const grade=score>=60?'A':score>=35?'B':'C';
    const tag=grade==='A'?'🔥 A nóng':grade==='B'?'🌤 B trung bình':'❄ C nuôi';
    return {score,grade,tag};
  }
  function timeline(){
    const now=new Date();
    const d=days=>{const x=new Date(now);x.setDate(x.getDate()+days);return x.toISOString().slice(0,10);};
    return [
      {step:'D0 mới',date:d(0),color:'#0f766e'},
      {step:'D1 gọi',date:d(1),color:'#2563eb'},
      {step:'D3 nhắc',date:d(3),color:'#f59e0b'},
      {step:'D7 nuôi',date:d(7),color:'#64748b'},
      {step:'D14 đóng',date:d(14),color:'#334155'},
      {step:'Quá hạn',date:'',color:'#dc2626'}
    ];
  }
  function enrichLead(lead){
    lead=lead||{};
    lead.source = lead.source || detectSource();
    lead.utm_source = lead.utm_source || (lead.source==='Google SEO'?'google-seo':lead.source.toLowerCase());
    lead.sourcePage = lead.sourcePage || location.href;
    const s=scoreLead(lead);
    lead.aiScore=s.score; lead.aiGrade=s.grade; lead.aiTag=s.tag;
    lead.timeline=lead.timeline || JSON.stringify(timeline());
    lead.status=lead.status || 'D0 mới';
    lead.nextCall=lead.nextCall || 'D1 gọi';
    lead.followupDay=lead.followupDay || 'D1';
    return lead;
  }
  window.V247_LEAD_ENGINE_V216 = {SOURCES,detectSource,scoreLead,timeline,enrichLead};
})();
