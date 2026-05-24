// V21.5.1 Customer UI Professional
(function(){
  function killOld(){
    document.querySelectorAll('#v2146Actions,#v2146Panel,#v2145Root,#v2145Panel,#v2143Root,#v2143Panel,#v2142Actions,#v2142Panel,#v214Chatbot,#v2133AiRoot,#v21AiBox,#aiProV2132').forEach(e=>e.remove());
    document.querySelectorAll('a,button').forEach(el=>{
      const t=(el.textContent||'').toLowerCase();
      const h=(el.getAttribute('href')||'').toLowerCase();
      if(t.includes('zalo')||h.includes('zalo.me')||t.includes('ai tư vấn')||t.includes('ai v21')||t.includes('tư vấn ai')) el.style.display='none';
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
  function initChat(){
    const open=document.getElementById('v2151ChatOpen');
    const box=document.getElementById('v2151ChatBox');
    const close=document.getElementById('v2151ChatClose');
    const send=document.getElementById('v2151Send');
    const input=document.getElementById('v2151Text');
    const msgs=document.getElementById('v2151Msgs');
    if(!open||!box) return;
    function add(role,text){msgs.innerHTML+='<div class="chat-msg '+role+'">'+String(text).replace(/[<>&]/g,'')+'</div>';msgs.scrollTop=msgs.scrollHeight;}
    open.onclick=()=>{box.style.display=box.style.display==='block'?'none':'block'; if(box.style.display==='block') input.focus();};
    close.onclick=()=>box.style.display='none';
    send.onclick=()=>{const q=input.value.trim(); if(!q)return; add('user',q); add('bot',answer(q)); input.value='';};
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send.click();}});
  }
  document.addEventListener('DOMContentLoaded',()=>{killOld();initChat();});
  setTimeout(killOld,800);
})();
