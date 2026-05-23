// V20.9 Automation glue
(function(){
  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  ready(function(){
    try{
      document.querySelectorAll('small').forEach(el=>{
        if(el.textContent.includes('V20.')) el.textContent=el.textContent.replace(/V20\.[0-9.]+[^ ]*/,'V20.9 Solo Operator');
      });
      const mark=document.createElement('div');
      mark.style.cssText='position:fixed;left:12px;bottom:12px;background:#0f766e;color:white;padding:8px 12px;border-radius:999px;font-weight:900;z-index:9999;font-size:12px';
      mark.textContent='V20.9 Automation';
      document.body.appendChild(mark);
    }catch(e){}
  });
})();
