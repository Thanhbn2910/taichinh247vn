// V21.3.2 — Home professional UI + website topic AI
(function(){
  const CALL_PHONE = '0822397836';

  function textIncludes(el, words){
    const t = (el.textContent || '').toLowerCase();
    return words.some(w => t.includes(w));
  }

  function answerFAQ(q){
    q = String(q || '').toLowerCase();
    if(!q.trim()) return 'Bạn có thể hỏi về vay tín chấp, CIC/nợ xấu, thẻ tín dụng, bảo hiểm hoặc quy trình tư vấn.';
    if(q.includes('cic')) return 'CIC là thông tin lịch sử tín dụng. Khi tư vấn cần xem nhóm nợ, tình trạng tất toán, thu nhập và nhu cầu vay hiện tại.';
    if(q.includes('nợ xấu') || q.includes('no xau') || q.includes('nhóm nợ')) return 'Nợ xấu vẫn có thể được xem xét tùy nhóm nợ, thời gian tất toán và hồ sơ hiện tại. Bạn nên để lại SĐT để được kiểm tra hướng phù hợp.';
    if(q.includes('tín chấp') || q.includes('vay')) return 'Vay tín chấp thường cần thu nhập ổn định, SĐT liên hệ, thông tin CIC và nhu cầu vay. Hệ thống sẽ gợi ý hướng tư vấn phù hợp.';
    if(q.includes('thẻ') || q.includes('tín dụng')) return 'Thẻ tín dụng phụ thuộc thu nhập, lịch sử tín dụng và hồ sơ cá nhân. Có thể tư vấn theo nhu cầu mở thẻ, hạn mức và mục đích sử dụng.';
    if(q.includes('bảo hiểm') || q.includes('bhnt') || q.includes('sức khỏe')) return 'Bảo hiểm nên chọn theo nhu cầu bảo vệ, ngân sách, độ tuổi và mục tiêu tài chính. Không nên mua chỉ vì được chào mời.';
    if(q.includes('bảo mật') || q.includes('thông tin')) return 'Thông tin khách để lại chỉ dùng để tư vấn, kiểm tra nhu cầu và liên hệ hỗ trợ. Không hiển thị công khai trên website.';
    if(q.includes('bao lâu') || q.includes('khi nào') || q.includes('gọi')) return 'Sau khi gửi form, bạn nên được liên hệ sớm để xác nhận nhu cầu, thu nhập và hồ sơ cơ bản.';
    return 'Nội dung này liên quan đến tư vấn tài chính cá nhân. Bạn có thể hỏi rõ hơn về CIC, nợ xấu, vay tín chấp, thẻ tín dụng hoặc bảo hiểm để AI trả lời cụ thể hơn.';
  }

  function cleanPublicUI(){
    // Hide public version labels only on customer-facing pages
    if(!location.pathname.includes('admin.html')){
      document.querySelectorAll('small,.version,.badge').forEach(el => {
        const t = (el.textContent || '').toLowerCase();
        if(t.includes('v20') || t.includes('v21') || t.includes('crm v') || t.includes('hotfix') || t.includes('automation')) {
          el.style.display = 'none';
        }
      });
    }

    // Remove operational technical phrase from customer copy
    document.querySelectorAll('p,span,div,small').forEach(el => {
      if(el.children.length > 3) return;
      const t = el.textContent || '';
      if(t.includes('Thông tin gửi về Google Sheet + Gmail + CRM')) {
        el.textContent = 'Thông tin của bạn được bảo mật và chỉ dùng để tư vấn phù hợp.';
      }
      if(t.includes('Google Sheet') || t.includes('Gmail + CRM')) {
        el.textContent = t
          .replace('Google Sheet + Gmail + CRM', 'hệ thống tư vấn')
          .replace('Google Sheet, Gmail và CRM', 'hệ thống tư vấn');
      }
    });

    // Hide Zalo until new number
    document.querySelectorAll('a,button').forEach(el => {
      const t = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      if(t.includes('zalo') || href.includes('zalo.me')) el.style.display='none';
    });

    // Normalize call button text
    document.querySelectorAll('a,button').forEach(el => {
      const t = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      if(t.includes('gọi ngay') || href.startsWith('tel:')) {
        el.textContent = 'Gọi ngay 0822397836';
        if(el.tagName.toLowerCase()==='a') el.setAttribute('href','tel:0822397836');
      }
    });

    // Deduplicate AI buttons but keep one
    const aiBtns = Array.from(document.querySelectorAll('button,a')).filter(el => {
      const t = (el.textContent || '').toLowerCase();
      return t.includes('ai tư vấn') || t.includes('ai v21');
    });
    aiBtns.forEach((el,i)=>{ if(i>0) el.style.display='none'; });

    // Add compact class to common CTA/floating areas
    document.body.classList.add('home-pro-v2132');
  }

  function renderBetterAI(){
    if(document.getElementById('aiProV2132')) return;
    // Hide existing AI floating button/panel if duplicated
    document.querySelectorAll('#v21AiBox').forEach(el => el.style.display = 'none');

    const box = document.createElement('div');
    box.id = 'aiProV2132';
    box.innerHTML = `
      <button id="aiProBtn">AI tư vấn</button>
      <div id="aiProPanel">
        <div class="aiHead">AI tư vấn tài chính <button id="aiProClose">×</button></div>
        <div id="aiProMsgs">
          <div class="aiMsg bot">Bạn có thể hỏi về CIC, nợ xấu, vay tín chấp, thẻ tín dụng, bảo hiểm hoặc quy trình tư vấn.</div>
        </div>
        <div class="aiForm">
          <textarea id="aiProQuestion" placeholder="Nhập câu hỏi của bạn..."></textarea>
          <div class="aiQuick">
            <button type="button">CIC là gì?</button>
            <button type="button">Nợ xấu vay được không?</button>
            <button type="button">Vay tín chấp cần gì?</button>
          </div>
          <button id="aiProSend" type="button">Hỏi AI</button>
        </div>
      </div>`;
    document.body.appendChild(box);

    const panel = document.getElementById('aiProPanel');
    const msgs = document.getElementById('aiProMsgs');
    const q = document.getElementById('aiProQuestion');
    document.getElementById('aiProBtn').onclick = () => panel.style.display='block';
    document.getElementById('aiProClose').onclick = () => panel.style.display='none';
    function send(v){
      v = v || q.value;
      if(!String(v).trim()) return;
      msgs.innerHTML += `<div class="aiMsg user">${v.replace(/[<>&]/g,'')}</div>`;
      msgs.innerHTML += `<div class="aiMsg bot">${answerFAQ(v)}</div>`;
      q.value='';
      msgs.scrollTop = msgs.scrollHeight;
    }
    document.getElementById('aiProSend').onclick = () => send();
    document.querySelectorAll('.aiQuick button').forEach(b => b.onclick = () => send(b.textContent));
  }

  document.addEventListener('DOMContentLoaded', function(){
    cleanPublicUI();
    renderBetterAI();
  });
  setTimeout(cleanPublicUI, 800);
  setTimeout(cleanPublicUI, 1600);
})();
