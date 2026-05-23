// V21.3.1 HOTFIX — safe home cleanup, no destructive DOM rewrite
(function(){
  const CALL_PHONE = '0822397836';
  function safeClean(){
    // Hide Zalo only
    document.querySelectorAll('a,button').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      if(text.includes('zalo') || href.includes('zalo.me')) {
        el.style.display = 'none';
      }
    });

    // Normalize call buttons/links
    document.querySelectorAll('a,button').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      if(text.includes('gọi ngay') || href.startsWith('tel:')) {
        el.textContent = '📞 Gọi ngay 0822397836';
        if(el.tagName.toLowerCase()==='a') el.setAttribute('href','tel:0822397836');
      }
    });

    // Keep only one floating AI button/panel trigger
    const ai = Array.from(document.querySelectorAll('a,button')).filter(el => {
      const t=(el.textContent||'').toLowerCase();
      return t.includes('ai tư vấn') || t.includes('ai v21');
    });
    ai.forEach((el,i)=>{ if(i>0) el.style.display='none'; });
  }
  document.addEventListener('DOMContentLoaded', safeClean);
  setTimeout(safeClean, 600);
})();
