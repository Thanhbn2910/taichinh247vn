// V21.3 — Home Clean UI
(function(){
  const CALL_PHONE = '0822397836';
  function cleanHome(){
    // Hide all Zalo buttons/links for now
    document.querySelectorAll('a,button,div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute && (el.getAttribute('href') || '') || '').toLowerCase();
      if(text.includes('zalo') || href.includes('zalo.me')) {
        el.style.display = 'none';
      }
    });

    // Keep only one AI tư vấn floating button/panel trigger
    const aiEls = Array.from(document.querySelectorAll('a,button,div')).filter(el => {
      const text = (el.textContent || '').trim().toLowerCase();
      return text === '🤖 ai tư vấn' || text === 'ai tư vấn' || text === '🤖 ai v21' || text === 'ai v21';
    });
    aiEls.forEach((el, idx) => {
      if(idx > 0) el.style.display = 'none';
    });

    // Normalize call buttons
    document.querySelectorAll('a,button,div').forEach(el => {
      const text = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute && (el.getAttribute('href') || '') || '').toLowerCase();
      if(text.includes('gọi ngay') || href.startsWith('tel:')) {
        if(el.tagName.toLowerCase() === 'a' || el.tagName.toLowerCase() === 'button') {
          el.textContent = '📞 Gọi ngay 0822397836';
        }
        if(el.setAttribute) el.setAttribute('href', 'tel:0822397836');
      }
    });

    // Remove duplicate text
    document.body.innerHTML = document.body.innerHTML.replaceAll('Zalo sắp cập nhật sắp cập nhật', 'Zalo sắp cập nhật');
  }
  document.addEventListener('DOMContentLoaded', cleanHome);
  setTimeout(cleanHome, 500);
  setTimeout(cleanHome, 1500);
})();
