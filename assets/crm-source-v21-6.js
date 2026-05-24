(function(){
function run(){
document.querySelectorAll('table tbody tr').forEach(row=>{
 if(row.dataset.v216Source) return;
 const txt=(row.textContent||'').toLowerCase();
 let source='Direct';
 if(txt.includes('google')||txt.includes('seo')) source='Google SEO';
 else if(txt.includes('landing')) source='Landing';
 else if(txt.includes('blog')||txt.includes('posts')) source='Blog';
 else if(txt.includes('chat')) source='Chatbot';
 const first=row.children[0];
 if(first){const b=document.createElement('div');b.className='v216-source-badge';b.textContent='Nguồn: '+source;first.appendChild(b);}
 row.dataset.v216Source='1';
});
}
document.addEventListener('DOMContentLoaded',run);setInterval(run,3000);
})();