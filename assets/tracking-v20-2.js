function cleanPhone_(v){return String(v || '').replace(/\D/g,'');}
(function(){
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){dataLayer.push(arguments)};
function ev(n,p){try{gtag('event',n,Object.assign({page_location:location.href,page_title:document.title},p||{}));}catch(e){}}
window.V247Track={event:ev};
document.addEventListener('DOMContentLoaded',function(){
 ev('page_view_v20_2');
 document.querySelectorAll('form[data-lead]').forEach(function(f){
  ev('view_form',{form_id:f.id||'lead_form'});
  f.addEventListener('submit',function(){ev('submit_lead',{form_id:f.id||'lead_form'});});
 });
 document.querySelectorAll('a[href*="zalo.me"],[data-zalo]').forEach(a=>a.addEventListener('click',()=>ev('click_zalo')));
 document.querySelectorAll('a[href^="tel:"],[data-call]').forEach(a=>a.addEventListener('click',()=>ev('click_call')));
 document.querySelectorAll('.btn,a').forEach(a=>a.addEventListener('click',()=>{if((a.textContent||'').toLowerCase().includes('tư vấn'))ev('click_cta');}));
});
})();