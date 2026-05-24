// V21.6.3 STABLE LOCK — source map, full timeline labels, tel call button
(function(){
  function text(el){ return (el && el.textContent || '').trim(); }

  function detectSourceFromRow(row){
    const t = text(row).toLowerCase();
    if (t.includes('google') || t.includes('seo')) return 'Google SEO';
    if (t.includes('/landing/') || t.includes('landing')) return 'Landing';
    if (t.includes('/posts/') || t.includes('blog') || t.includes('posts')) return 'Blog';
    if (t.includes('chat')) return 'Chat';
    return 'Direct';
  }

  function normalizeTimeline(row){
    const t = text(row).toLowerCase();
    if (t.includes('quá hạn') || t.includes('qua han')) return {label:'🔴 Quá hạn', cls:'overdue'};
    if (t.includes('d14')) return {label:'🟠 D14 Chốt', cls:'d14'};
    if (t.includes('d7')) return {label:'🟡 D7 Nuôi', cls:'d7'};
    if (t.includes('d3')) return {label:'🟡 D3 Nhắc', cls:'d3'};
    if (t.includes('d1')) return {label:'🟢 D1 Gọi', cls:'d1'};
    return {label:'🟢 D0 Mới', cls:'d0'};
  }

  function findPhone(row){
    const m = text(row).match(/0\d{8,10}|\b\d{9,11}\b/);
    return m ? m[0] : '';
  }

  function patchRows(){
    document.querySelectorAll('table tbody tr').forEach(row=>{
      // Source badge: remove old default if direct but better source can be detected
      const source = detectSourceFromRow(row);
      row.querySelectorAll('.v216-source-badge,.v2163-source-badge').forEach(e=>e.remove());
      const first = row.children[0];
      if (first){
        const b = document.createElement('div');
        b.className = 'v2163-source-badge';
        b.textContent = 'Nguồn: ' + source;
        first.appendChild(b);
      }

      // Timeline label
      const timeline = normalizeTimeline(row);
      row.querySelectorAll('.v2163-timeline-pill').forEach(e=>e.remove());
      let target = null;
      Array.from(row.children).forEach(td=>{
        const s = text(td).toLowerCase();
        if (s.includes('gọi') || s.includes('d1') || s.includes('d3') || s.includes('d7') || s.includes('d14') || s.includes('quá hạn')) {
          if (!target) target = td;
        }
      });
      if (target){
        const pill = document.createElement('div');
        pill.className = 'v2163-timeline-pill ' + timeline.cls;
        pill.textContent = timeline.label;
        target.appendChild(pill);
      }

      // Call button -> tel link
      const phone = findPhone(row);
      if (phone){
        Array.from(row.querySelectorAll('button,a')).forEach(btn=>{
          const s = text(btn).toLowerCase();
          if (s === 'gọi' || s.includes('gọi')) {
            if (btn.tagName.toLowerCase() === 'a') {
              btn.href = 'tel:' + phone;
            } else {
              const a = document.createElement('a');
              a.href = 'tel:' + phone;
              a.className = btn.className || 'btn';
              a.textContent = btn.textContent || 'Gọi';
              a.style.cssText = btn.getAttribute('style') || '';
              btn.replaceWith(a);
            }
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', patchRows);
  setTimeout(patchRows, 600);
  setTimeout(patchRows, 1500);
  setInterval(patchRows, 3000);
})();
