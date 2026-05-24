// V21.5.5 — CRM Income Field Fix
(function(){
  function getText(el){ return (el && el.textContent || '').trim(); }

  function parseIncomeFromRow(row){
    const txt = getText(row);
    // Try to find common income patterns in hidden/full row text or suggestion cell
    const m = txt.match(/(?:thu\s*nhập|income)\D{0,12}(\d{1,3}(?:[.,]\d+)?\s*(?:tr|triệu|trieu|m|đ|vnd)?)/i);
    if(m) return m[1].trim();
    // fallback: find amount-like text, but avoid phone
    const all = txt.match(/\b\d{1,3}(?:[.,]\d+)?\s*(?:tr|triệu|trieu|m)\b/i);
    if(all) return all[0].trim();
    return '';
  }

  function normalizeIncome(v){
    v = String(v || '').trim();
    if(!v) return 'Chưa có';
    if(/^\d+$/.test(v) && Number(v) > 1000000){
      const n = Math.round(Number(v)/1000000);
      return n + ' triệu';
    }
    return v;
  }

  function patchTable(){
    const tables = Array.from(document.querySelectorAll('table'));
    tables.forEach(table => {
      if(table.dataset.v2155IncomePatched) return;
      const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
      if(!headerRow) return;
      const headers = Array.from(headerRow.children).map(th => getText(th).toLowerCase());
      if(!headers.some(h => h.includes('khách'))) return;
      if(headers.some(h => h.includes('thu nhập'))) {
        table.dataset.v2155IncomePatched = '1';
        return;
      }

      // Insert after Khách column if possible, otherwise before AI
      let insertIndex = headers.findIndex(h => h.includes('ai'));
      if(insertIndex < 0) insertIndex = Math.min(1, headerRow.children.length);

      const th = document.createElement(headerRow.children[0].tagName || 'th');
      th.textContent = 'Thu nhập';
      th.className = 'v2155-income-head';
      headerRow.insertBefore(th, headerRow.children[insertIndex] || null);

      const bodyRows = table.querySelectorAll('tbody tr');
      bodyRows.forEach(row => {
        const td = document.createElement('td');
        td.className = 'v2155-income-cell';
        const val =
          row.dataset.income ||
          row.getAttribute('data-income') ||
          row.querySelector('[data-income]')?.getAttribute('data-income') ||
          row.querySelector('.income,.thu-nhap,[class*="income"],[class*="thu-nhap"]')?.textContent ||
          parseIncomeFromRow(row);
        td.innerHTML = '<b>' + normalizeIncome(val) + '</b>';
        row.insertBefore(td, row.children[insertIndex] || null);
      });

      table.dataset.v2155IncomePatched = '1';
    });
  }

  // Patch card/list rows if CRM is not table-based
  function patchCards(){
    document.querySelectorAll('.lead-card,.crm-card,.kp,.card').forEach(card => {
      if(card.dataset.v2155IncomeCard) return;
      const txt = getText(card).toLowerCase();
      if(!txt.includes('khách') && !txt.match(/\b0\d{8,10}\b/)) return;
      if(txt.includes('thu nhập')) return;
      const val = normalizeIncome(card.dataset.income || parseIncomeFromRow(card));
      const box = document.createElement('div');
      box.className = 'v2155-income-badge';
      box.innerHTML = '<span>Thu nhập</span><b>' + val + '</b>';
      card.appendChild(box);
      card.dataset.v2155IncomeCard = '1';
    });
  }

  function run(){
    patchTable();
    patchCards();
  }

  document.addEventListener('DOMContentLoaded', run);
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setInterval(run, 3000);
})();
