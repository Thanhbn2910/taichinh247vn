// V21.4.7 — NO FLOATING OVERLAY
(function(){
  const CALL_PHONE='0822397836';

  function esc(s){
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function killAllFloating(){
    document.querySelectorAll('#v2146Actions,#v2146Panel,#v2145Root,#v2145Panel,#v2143Root,#v2143Panel,#v2142Actions,#v2142Panel,#v214Chatbot,#v2133AiRoot,#v21AiBox,#aiProV2132').forEach(e=>e.remove());

    document.querySelectorAll('a,button,div').forEach(el=>{
      const t=(el.textContent||'').toLowerCase();
      const h=(el.getAttribute&&el.getAttribute('href')||'').toLowerCase();
      if(t.includes('zalo')||h.includes('zalo.me')||t.includes('ai tư vấn')||t.includes('ai v21')||t.includes('tư vấn ai')) {
        el.style.display='none';
      }
    });
  }

  function answer(q){
    const t=String(q||'').toLowerCase();
    if(t.includes('cic')) return 'CIC là lịch sử tín dụng. Cần xem nhóm nợ, thời điểm tất toán, thu nhập và nhu cầu vay.';
    if(t.includes('nợ xấu')||t.includes('no xau')) return 'Nợ xấu có thể xem xét tùy nhóm nợ, đã tất toán chưa và hồ sơ hiện tại.';
    if(t.includes('vay')||t.includes('tín chấp')) return 'Vay tín chấp cần SĐT, thu nhập, nhu cầu vay và tình trạng CIC.';
    if(t.includes('thẻ')||t.includes('tín dụng')) return 'Thẻ tín dụng phụ thuộc thu nhập, lịch sử tín dụng và nhu cầu sử dụng.';
    if(t.includes('bảo hiểm')||t.includes('bhnt')) return 'Bảo hiểm nên chọn theo nhu cầu bảo vệ, ngân sách và quyền lợi rõ ràng.';
    return 'Bạn có thể hỏi về CIC, nợ xấu, vay tín chấp, thẻ tín dụng hoặc bảo hiểm.';
  }

  function addInlineActions(){
    if(location.pathname.toLowerCase().includes('admin.html')) return;
    if(document.querySelector('.v2147-inline-actions')) return;

    const anchor =
      document.querySelector('a[href="#lead-form"]')?.parentElement ||
      document.querySelector('form') ||
      document.querySelector('.hero div') ||
      document.querySelector('main') ||
      document.body;

    const wrap=document.createElement('div');
    wrap.className='v2147-inline-actions';
    wrap.innerHTML=`<a class="v2147-call" href="tel:0822397836">Gọi ngay 0822397836</a>
      <button class="v2147-chat" type="button">Chat tư vấn</button>
      <div id="v2147ChatBox">
        <div class="v2147Head"><span>Chat tư vấn</span><button type="button" id="v2147Close" style="background:transparent;border:0;color:white;font-weight:900">×</button></div>
        <div id="v2147Msgs"><div class="v2147Msg bot">Xin chào! Bạn cần tư vấn về vay, CIC, thẻ hay bảo hiểm?</div></div>
        <div class="v2147Input"><textarea id="v2147Text" placeholder="Nhập câu hỏi..."></textarea><button id="v2147Send" type="button">Gửi</button></div>
      </div>`;

    anchor.appendChild(wrap);

    const box=wrap.querySelector('#v2147ChatBox');
    const btn=wrap.querySelector('.v2147-chat');
    const close=wrap.querySelector('#v2147Close');
    const input=wrap.querySelector('#v2147Text');
    const msgs=wrap.querySelector('#v2147Msgs');

    function add(role,text){
      msgs.innerHTML+='<div class="v2147Msg '+role+'">'+esc(text)+'</div>';
      msgs.scrollTop=msgs.scrollHeight;
    }

    btn.onclick=()=>box.style.display=box.style.display==='block'?'none':'block';
    close.onclick=()=>box.style.display='none';
    wrap.querySelector('#v2147Send').onclick=()=>{
      const q=String(input.value||'').trim();
      if(!q) return;
      add('user',q);
      add('bot',answer(q));
      input.value='';
    };
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();wrap.querySelector('#v2147Send').click();}});
  }

  document.addEventListener('DOMContentLoaded',()=>{killAllFloating();addInlineActions();});
  setTimeout(()=>{killAllFloating();addInlineActions();},700);
  setTimeout(killAllFloating,1500);
})();
