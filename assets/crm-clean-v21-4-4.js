// V21.4.4 CRM clean: remove public widgets from CRM/admin only
(function(){
  function cleanCRM(){
    document.querySelectorAll('#v2143Root,#v2143Panel,#v2142Actions,#v2142Panel,#v214Chatbot,#v2133AiRoot,#v21AiBox,#aiProV2132').forEach(e=>e.remove());
    document.querySelectorAll('a,button').forEach(el=>{
      const t=(el.textContent||'').toLowerCase();
      const href=(el.getAttribute('href')||'').toLowerCase();
      if(t.includes('chat tư vấn') || t.includes('ai tư vấn') || t.includes('zalo') || href.includes('zalo.me')){
        // Do not hide normal CRM row call buttons
        if(!t.trim().match(/^gọi$/)) el.style.display='none';
      }
    });
  }
  document.addEventListener('DOMContentLoaded', cleanCRM);
  setTimeout(cleanCRM, 800);
  setTimeout(cleanCRM, 1600);
})();
