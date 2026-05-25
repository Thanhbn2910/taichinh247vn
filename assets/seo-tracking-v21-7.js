// V21.7 SEO Engine lead/source tracking
(function(){
  function detectSEOIntent(){
    const p = location.pathname.toLowerCase();
    if(p.includes('/posts/')) return 'Blog';
    if(p.includes('/landing/')) return 'Landing';
    if(p.includes('/seo-engine/')) return 'SEO Cluster';
    return 'Direct';
  }
  window.V247_SEO_V217 = {
    source: detectSEOIntent(),
    page: location.pathname,
    title: document.title
  };
  window.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('form').forEach(form=>{
      if(form.dataset.v217Seo) return;
      form.dataset.v217Seo='1';
      const add=(name,value)=>{
        if(form.querySelector('[name="'+name+'"]')) return;
        const input=document.createElement('input');
        input.type='hidden'; input.name=name; input.value=value;
        form.appendChild(input);
      };
      add('source', window.V247_SEO_V217.source);
      add('seo_page', window.V247_SEO_V217.page);
      add('seo_title', window.V247_SEO_V217.title);
    });
  });
})();
