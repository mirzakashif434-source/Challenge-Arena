(() => {
  const modal=document.getElementById('arenaRush');
  if(!modal)return;
  let hooked=false;
  function upgrade(){
    if(hooked)return; hooked=true;
    const original=window.startArenaRush;
    if(typeof original!=='function')return;
    window.startArenaRush=()=>{original(); setTimeout(()=>{
      const canvas=document.getElementById('arenaCanvas');
      if(!canvas||canvas.dataset.v4)return; canvas.dataset.v4='1';
      const note=document.getElementById('arenaStatus');
      if(note)note.textContent='⚡ V4: Faster cores • 3 rival hits = knockout';
    },40)};
  }
  upgrade();
})();
