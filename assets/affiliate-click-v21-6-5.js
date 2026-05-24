// V21.6.5 Affiliate Click Tracking
(function(){
  function cfg(){ return window.VAYNHANH247_CONFIG || {}; }
  function source(){
    const p = location.pathname.toLowerCase();
    const qs = new URLSearchParams(location.search);
    const utm = String(qs.get('utm_source') || '').toLowerCase();
    if(utm.includes('google')) return 'Google SEO';
    if(p.includes('/posts/')) return 'Blog';
    if(p.includes('/landing/')) return 'Landing';
    if(String(qs.get('source')||'').toLowerCase().includes('chat')) return 'Chat';
    return 'Direct';
  }
  function id(){ return 'CLK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase(); }
  async function saveLeadClick(data){
    data = data || {};
    const click = {
      id: id(),
      action: 'affiliate_click',
      eventType: 'AFFILIATE_CLICK',
      name: data.name || 'Khách click affiliate',
      phone: data.phone || '',
      service: data.product || data.type || 'Affiliate',
      income: '',
      need: 'Click link ngoài: ' + (data.target || data.product || ''),
      note: 'Affiliate click tracking V21.6.5',
      type: data.type || '',
      product: data.product || '',
      target: data.target || '',
      affiliateUrl: data.href || data.url || '',
      article: location.pathname,
      source: data.source || source(),
      sourcePage: location.href,
      ref: document.referrer || '',
      userAgent: navigator.userAgent || '',
      createdAt: new Date().toISOString(),
      status: 'Affiliate Click',
      aiScore: 0,
      aiGrade: 'CLICK',
      aiTag: '🔗 Click ngoài',
      timeline: 'Click → Ghi CRM → Mở link ngoài'
    };

    localStorage.setItem('v247_last_affiliate_click', JSON.stringify(click));

    const GAS_URL = cfg().GAS_URL;
    if(!GAS_URL) return {ok:false,error:'Missing GAS_URL'};

    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: {'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify({action:'affiliateClick', lead:click})
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch(e){ return {ok:res.ok,text:text}; }
  }

  window.saveLeadClick = async function(data){
    try { return await saveLeadClick(data); }
    catch(e){ console.warn('Affiliate click tracking error', e); return {ok:false,error:String(e)}; }
  };

  document.addEventListener('click', function(e){
    const a = e.target.closest && e.target.closest('a[data-affiliate]');
    if(!a) return;
    const href = a.href;
    const data = {
      type: a.dataset.type || '',
      product: a.dataset.product || a.textContent.trim(),
      target: a.dataset.target || '',
      href: href
    };
    // For same-tab links, delay briefly so tracking can fire
    if(!a.target || a.target === '_self'){
      e.preventDefault();
      window.saveLeadClick(data).finally(()=>{ location.href = href; });
    } else {
      window.saveLeadClick(data);
    }
  }, true);
})();
