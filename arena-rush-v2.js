(() => {
  // Additive Arena Rush v2 layer: keeps the existing game intact.
  const modal = document.getElementById('arenaRush');
  if (!modal || document.getElementById('arenaV2Panel')) return;

  const KEY = 'challengeArenaArenaV2';
  const state = JSON.parse(localStorage.getItem(KEY) || '{"coins":0,"level":1,"wins":0,"runs":0,"best":0,"skin":"neon"}');
  const skins = { neon: '🟢 Neon', sun: '🟡 Solar', ice: '🔵 Ice', royal: '🟣 Royal' };
  const milestones = [1000, 3000, 6000, 10000];
  let lastScore = 0;

  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
  function level(){ return Math.min(10, Math.floor(state.coins / 1000) + 1); }
  function coinsFor(score, won){ return Math.max(10, Math.floor(score / 25) + (won ? 100 : 0)); }
  function panel(){
    const box = modal.querySelector('.arena-box');
    if (!box) return;
    const el = document.createElement('div'); el.id='arenaV2Panel'; el.className='arena-v2-panel';
    el.innerHTML = `
      <div class="arena-v2-top"><span>🪙 <b id="arenaV2Coins">0</b></span><span>⭐ Lv.<b id="arenaV2Level">1</b></span><span>🏆 <b id="arenaV2Wins">0</b></span></div>
      <div class="arena-v2-mission"><b>🎯 Mission</b><span id="arenaV2Mission">Collect 10 energy cores</span></div>
      <div class="arena-v2-skins"><b>🎨 Skin</b><div id="arenaV2SkinButtons"></div></div>`;
    const help = box.querySelector('.arena-help'); box.insertBefore(el, help || null);
    const buttons = el.querySelector('#arenaV2SkinButtons');
    Object.entries(skins).forEach(([id,name],i)=>{ const b=document.createElement('button');b.type='button';b.textContent=name;b.className='arena-skin '+(state.skin===id?'selected':'');b.disabled=i>level()-1;b.onclick=()=>{state.skin=id;save();render();};buttons.appendChild(b); });
  }
  function render(){
    const c=document.getElementById('arenaV2Coins'),l=document.getElementById('arenaV2Level'),w=document.getElementById('arenaV2Wins'),m=document.getElementById('arenaV2Mission');
    if(c)c.textContent=state.coins;l&&(l.textContent=level());w&&(w.textContent=state.wins);
    if(m){ const target=10; m.textContent=`Collect ${target} energy cores • ${state.coins>=milestones[0]?'Mission bonus unlocked!':'Earn coins to unlock more skins'}`; }
    document.querySelectorAll('.arena-skin').forEach((b,i)=>{b.classList.toggle('selected',Object.keys(skins)[i]===state.skin);b.disabled=i>level()-1;});
  }
  function finish(e){
    const d=e.detail||{}, earned=coinsFor(Number(d.score)||0,!!d.won); lastScore=Number(d.score)||0;
    state.coins += earned; state.runs += 1; if(d.won) state.wins += 1; state.best=Math.max(state.best,lastScore); save(); render();
    const result=document.getElementById('arenaResult');
    if(result && !result.dataset.v2){result.dataset.v2='1';result.innerHTML += `<br><span class="arena-v2-reward">🪙 +${earned} coins · ⭐ Level ${level()}</span>`;}
  }
  panel();render();window.addEventListener('arenaRushFinished',finish);
})();
