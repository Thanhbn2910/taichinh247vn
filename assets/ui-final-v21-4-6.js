// V21.4.6 UI FINAL FIX2
(function(){
  if(location.pathname.toLowerCase().includes('admin.html')) return;
  const CALL_PHONE='0822397836';
  let history=JSON.parse(localStorage.getItem('v247_chat_2146')||'[]');

  function esc(s){
    return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function save(){localStorage.setItem('v247_chat_2146',JSON.stringify(history.slice(-10)));}

  function killOld(){
    document.querySelectorAll('#v2145Root,#v2145Panel,#v2143Root,#v2143Panel,#v2142Actions,#v2142Panel,#v214Chatbot,#v2133AiRoot,#v21AiBox,#aiProV2132').forEach(e=>e.remove());
    document.querySelectorAll('a,button').forEach(el=>{
      if(el.closest('#v2146Actions')||el.closest('#v2146Panel')) return;
      const t=(el.textContent||'').toLowerCase();
      const h=(el.getAttribute('href')||'').toLowerCase();
      if(t.includes('zalo')||h.includes('zalo.me')||t.includes('ai tư vấn')||t.includes('ai v21')||t.includes('tư vấn ai')||t.trim()==='chat') {
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

  function render(){
    killOld();
    if(document.getElementById('v2146Actions')) return;

    const actions=document.createElement('div');
    actions.id='v2146Actions';
    actions.innerHTML=`<a id="v2146Call" href="tel:0822397836">Gọi ngay 0822397836</a><button id="v2146ChatOpen" type="button">Chat tư vấn</button>`;
    document.body.appendChild(actions);

    const panel=document.createElement('div');
    panel.id='v2146Panel';
    panel.innerHTML=`<div class="v2146Head"><b>Chat tư vấn</b><button id="v2146Close" type="button">×</button></div>
      <div id="v2146Msgs"></div>
      <div class="v2146Quick"><button type="button">CIC là gì?</button><button type="button">Nợ xấu?</button></div>
      <div class="v2146Input"><textarea id="v2146Text" placeholder="Nhập câu hỏi..."></textarea>
      <div class="v2146Actions"><button id="v2146Send" type="button">Gửi</button></div></div>`;
    document.body.appendChild(panel);

    const msgs=document.getElementById('v2146Msgs');
    const input=document.getElementById('v2146Text');

    function add(role,text){
      history.push({role,text,time:new Date().toISOString()});
      save();
      msgs.innerHTML+='<div class="v2146Msg '+role+'">'+esc(text).replace(/\n/g,'<br>')+'</div>';
      msgs.scrollTop=msgs.scrollHeight;
    }

    if(history.length) {
      history.slice(-5).forEach(m=>msgs.innerHTML+='<div class="v2146Msg '+m.role+'">'+esc(m.text).replace(/\n/g,'<br>')+'</div>');
    } else {
      add('bot','Xin chào! Bạn cần tư vấn về vay, CIC, thẻ hay bảo hiểm?');
    }

    function send(v){
      const q=String(v||input.value||'').trim();
      if(!q) return;
      add('user',q);
      add('bot',answer(q));
      input.value='';
    }

    document.getElementById('v2146ChatOpen').onclick=()=>{panel.style.display=panel.style.display==='block'?'none':'block';if(panel.style.display==='block')input.focus();};
    document.getElementById('v2146Close').onclick=()=>panel.style.display='none';
    document.getElementById('v2146Send').onclick=()=>send();
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});
    document.querySelectorAll('.v2146Quick button').forEach(b=>b.onclick=()=>send(b.textContent));
  }

  document.addEventListener('DOMContentLoaded',render);
  setTimeout(render,700);
  setTimeout(killOld,1500);
})();
