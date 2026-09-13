(function(){
  // Lightweight client-side hardening that does not change game logic.
  const addMeta=(name,content)=>{if(!document.querySelector('meta[name="'+name+'"]')){const m=document.createElement('meta');m.name=name;m.content=content;document.head.appendChild(m);}};
  addMeta('referrer','strict-origin-when-cross-origin');
  addMeta('color-scheme','light');
  addMeta('format-detection','telephone=no');

  // Keep keyboard/touch interactions predictable on phones without disabling accessibility zoom.
  document.addEventListener('click',function(e){
    const target=e.target.closest('button,a');
    if(target) target.setAttribute('data-touch-ready','1');
  },{passive:true});

  // Never expose accidental javascript: navigation from dynamically added links.
  document.addEventListener('click',function(e){
    const a=e.target.closest('a[href]');
    if(a && /^\s*javascript:/i.test(a.getAttribute('href')||'')) e.preventDefault();
  },{capture:true,passive:false});
})();