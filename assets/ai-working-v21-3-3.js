// V21.3.3 — AI tư vấn hoạt động độc lập
(function(){
  const CALL_PHONE = '0822397836';

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function answer(q){
    const t = String(q || '').toLowerCase();
    if(!t.trim()) return 'Bạn có thể hỏi về vay tín chấp, CIC/nợ xấu, thẻ tín dụng, bảo hiểm hoặc quy trình tư vấn.';
    if(t.includes('cic')) return 'CIC là lịch sử tín dụng của khách hàng. Khi tư vấn cần xem nhóm nợ, tình trạng tất toán, thu nhập hiện tại và nhu cầu vay.';
    if(t.includes('nợ xấu') || t.includes('no xau') || t.includes('nhóm nợ')) return 'Nợ xấu có thể vẫn được xem xét tùy nhóm nợ, thời gian tất toán và hồ sơ hiện tại. Nên để lại SĐT để kiểm tra hướng phù hợp.';
    if(t.includes('vay') || t.includes('tín chấp') || t.includes('tin chap')) return 'Vay tín chấp thường cần thu nhập ổn định, CIC phù hợp, SĐT liên hệ và nhu cầu vay rõ ràng. Bạn có thể để lại thông tin để được tư vấn nhanh.';
    if(t.includes('thẻ') || t.includes('the tin dung') || t.includes('tín dụng')) return 'Thẻ tín dụng phụ thuộc thu nhập, lịch sử tín dụng và hồ sơ cá nhân. Có thể tư vấn theo nhu cầu mở thẻ, hạn mức và mục đích sử dụng.';
    if(t.includes('bảo hiểm') || t.includes('bao hiem') || t.includes('bhnt')) return 'Bảo hiểm nên chọn theo nhu cầu bảo vệ, ngân sách, độ tuổi và mục tiêu tài chính. Không nên mua nếu chưa hiểu quyền lợi và phí duy trì.';
    if(t.includes('hồ sơ') || t.includes('giấy tờ')) return 'Hồ sơ thường cần thông tin cá nhân, SĐT, thu nhập, nhu cầu vay và tình trạng CIC. Tùy sản phẩm sẽ có yêu cầu khác nhau.';
    if(t.includes('gọi') || t.includes('liên hệ')) return 'Bạn có thể bấm nút Gọi ngay 0822397836 hoặc để lại form để được liên hệ.';
    return 'AI hiện hỗ trợ các nội dung chính trên website: vay tín chấp, CIC/nợ xấu, thẻ tín dụng, bảo hiểm, hồ sơ và quy trình tư vấn.';
  }

  function initAI(){
    if(document.getElementById('v2133AiRoot')) return;

    // Hide old AI boxes only, not this one
    document.querySelectorAll('#v21AiBox,#aiProV2132').forEach(el => el.style.display = 'none');

    const root = document.createElement('div');
    root.id = 'v2133AiRoot';
    root.innerHTML = `
      <button id="v2133AiButton" type="button">AI tư vấn</button>
      <div id="v2133AiPanel">
        <div class="v2133Head">
          <b>AI tư vấn VayNhanh247</b>
          <button id="v2133Close" type="button">×</button>
        </div>
        <div id="v2133Msgs">
          <div class="v2133Msg bot">Xin chào! Bạn có thể hỏi về CIC, nợ xấu, vay tín chấp, thẻ tín dụng, bảo hiểm hoặc hồ sơ cần chuẩn bị.</div>
        </div>
        <div class="v2133Body">
          <textarea id="v2133Question" placeholder="Nhập câu hỏi của bạn..."></textarea>
          <div class="v2133Quick">
            <button type="button">CIC là gì?</button>
            <button type="button">Nợ xấu vay được không?</button>
            <button type="button">Vay tín chấp cần gì?</button>
            <button type="button">Bảo hiểm nên mua không?</button>
          </div>
          <button id="v2133Send" type="button">Hỏi AI</button>
          <a id="v2133Call" href="tel:0822397836">Gọi ngay 0822397836</a>
        </div>
      </div>`;
    document.body.appendChild(root);

    const panel = document.getElementById('v2133AiPanel');
    const msgs = document.getElementById('v2133Msgs');
    const input = document.getElementById('v2133Question');

    document.getElementById('v2133AiButton').onclick = () => {
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
      if(panel.style.display === 'block') input.focus();
    };
    document.getElementById('v2133Close').onclick = () => panel.style.display = 'none';

    function send(value){
      const q = String(value || input.value || '').trim();
      if(!q) return;
      msgs.innerHTML += `<div class="v2133Msg user">${escapeHtml(q)}</div>`;
      msgs.innerHTML += `<div class="v2133Msg bot">${escapeHtml(answer(q))}</div>`;
      input.value = '';
      msgs.scrollTop = msgs.scrollHeight;
    }

    document.getElementById('v2133Send').onclick = () => send();
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    document.querySelectorAll('.v2133Quick button').forEach(btn => {
      btn.onclick = () => send(btn.textContent);
    });
  }

  function cleanUI(){
    // Hide Zalo
    document.querySelectorAll('a,button').forEach(el => {
      const t = (el.textContent || '').toLowerCase();
      const href = (el.getAttribute('href') || '').toLowerCase();
      if(t.includes('zalo') || href.includes('zalo.me')) el.style.display = 'none';
    });
    // Normalize call
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = 'tel:0822397836';
      if((a.textContent || '').toLowerCase().includes('gọi')) a.textContent = 'Gọi ngay 0822397836';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cleanUI();
    initAI();
  });
  setTimeout(() => { cleanUI(); initAI(); }, 800);
  setTimeout(() => { cleanUI(); initAI(); }, 1800);
})();
