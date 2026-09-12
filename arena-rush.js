(() => {
  const canvas = document.getElementById('arenaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('arenaCanvasWrap');
  const scoreEl = document.getElementById('arenaScore');
  const timeEl = document.getElementById('arenaTime');
  const energyEl = document.getElementById('arenaEnergy');
  const statusEl = document.getElementById('arenaStatus');
  const modal = document.getElementById('arenaRush');

  let w = 0, h = 0, raf = 0, running = false, last = 0, elapsed = 0;
  let score = 0, energy = 0, shield = 0, dash = 0;
  const keys = {up:false,down:false,left:false,right:false};
  const player = {x:0,y:0,r:13,speed:220};
  let orbs = [], rivals = [], powerups = [], particles = [];

  function resize(){
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(300, rect.width);
    h = Math.min(560, Math.max(320, w * 0.66));
    canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function rand(a,b){return a+Math.random()*(b-a)}
  function spawnOrb(){
    const a=rand(0,Math.PI*2), rr=rand(35,Math.min(w,h)*0.43);
    orbs.push({x:w/2+Math.cos(a)*rr,y:h/2+Math.sin(a)*rr,r:7,p:rand(0,6.28)});
  }
  function spawnRival(){
    rivals.push({x:rand(25,w-25),y:rand(25,h-25),r:12,dx:rand(-1,1),dy:rand(-1,1),speed:rand(48,78)});
  }
  function spawnPower(){
    powerups.push({x:rand(30,w-30),y:rand(30,h-30),r:9,type:Math.random()<.55?'shield':'dash',life:10});
  }
  function burst(x,y){
    for(let i=0;i<10;i++) particles.push({x,y,vx:rand(-90,90),vy:rand(-90,90),life:.5});
  }
  function reset(){
    cancelAnimationFrame(raf); resize();
    running=true; last=performance.now(); elapsed=0; score=0; energy=0; shield=0; dash=0;
    player.x=w/2; player.y=h/2; orbs=[]; rivals=[]; powerups=[]; particles=[];
    for(let i=0;i<12;i++)spawnOrb(); for(let i=0;i<4;i++)spawnRival(); spawnPower(); spawnPower();
    updateHud(); statusEl.textContent='Collect energy • stay inside the storm • beat the rivals';
    raf=requestAnimationFrame(loop);
  }
  function updateHud(){
    scoreEl.textContent=score; energyEl.textContent=energy+'/10';
    timeEl.textContent=Math.max(0,Math.ceil(45-elapsed))+'s';
  }
  function setKey(k,v){keys[k]=v}
  function bindHold(id,key){
    const b=document.getElementById(id); if(!b)return;
    ['pointerdown','touchstart'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();setKey(key,true)}));
    ['pointerup','pointercancel','pointerleave','touchend'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();setKey(key,false)}));
  }
  bindHold('arenaUp','up');bindHold('arenaDown','down');bindHold('arenaLeft','left');bindHold('arenaRight','right');
  document.getElementById('arenaDash').addEventListener('click',()=>{
    if(!running||dash<=0)return; dash--; const dx=(keys.right?1:0)-(keys.left?1:0),dy=(keys.down?1:0)-(keys.up?1:0);
    const len=Math.hypot(dx,dy)||1; player.x+=dx/len*75; player.y+=dy/len*75; burst(player.x,player.y); clampPlayer(); updateHud();
  });
  window.addEventListener('keydown',e=>{if(e.key==='ArrowUp'||e.key==='w')keys.up=true;if(e.key==='ArrowDown'||e.key==='s')keys.down=true;if(e.key==='ArrowLeft'||e.key==='a')keys.left=true;if(e.key==='ArrowRight'||e.key==='d')keys.right=true;if(e.key===' '){e.preventDefault();document.getElementById('arenaDash').click();}});
  window.addEventListener('keyup',e=>{if(e.key==='ArrowUp'||e.key==='w')keys.up=false;if(e.key==='ArrowDown'||e.key==='s')keys.down=false;if(e.key==='ArrowLeft'||e.key==='a')keys.left=false;if(e.key==='ArrowRight'||e.key==='d')keys.right=false;});
  window.addEventListener('resize',()=>{if(running)resize()});

  function clampPlayer(){player.x=Math.max(15,Math.min(w-15,player.x));player.y=Math.max(15,Math.min(h-15,player.y));}
  function stormRadius(){return Math.max(80,Math.min(w,h)*.48-elapsed*4.1)}
  function loop(now){
    if(!running)return; const dt=Math.min(.035,(now-last)/1000); last=now; elapsed+=dt;
    const dx=(keys.right?1:0)-(keys.left?1:0),dy=(keys.down?1:0)-(keys.up?1:0),len=Math.hypot(dx,dy)||1;
    player.x+=dx/len*player.speed*dt; player.y+=dy/len*player.speed*dt; clampPlayer();
    const centerX=w/2,centerY=h/2,rad=stormRadius();
    if(Math.hypot(player.x-centerX,player.y-centerY)>rad){
      if(shield>0) shield=Math.max(0,shield-dt); else score=Math.max(0,score-Math.ceil(18*dt));
    }
    rivals.forEach(r=>{
      const ax=player.x-r.x,ay=player.y-r.y,d=Math.hypot(ax,ay)||1;
      r.x+=ax/d*r.speed*dt+r.dx*20*dt;r.y+=ay/d*r.speed*dt+r.dy*20*dt;
      if(r.x<12||r.x>w-12)r.dx*=-1;if(r.y<12||r.y>h-12)r.dy*=-1;
      if(d<25){if(shield>0)shield=Math.max(0,shield-dt*2);else{score=Math.max(0,score-Math.floor(30*dt));player.x+=(player.x-r.x)/d*25;player.y+=(player.y-r.y)/d*25;}}
    });
    orbs.forEach(o=>o.p+=dt*3);
    for(let i=orbs.length-1;i>=0;i--){const o=orbs[i];if(Math.hypot(player.x-o.x,player.y-o.y)<player.r+o.r){orbs.splice(i,1);energy++;score+=100;burst(o.x,o.y);if(energy>=10){finish(true);return;}spawnOrb();if(energy%3===0)spawnPower();}}
    for(let i=powerups.length-1;i>=0;i--){const p=powerups[i];p.life-=dt;if(p.life<=0){powerups.splice(i,1);continue;}if(Math.hypot(player.x-p.x,player.y-p.y)<player.r+p.r){if(p.type==='shield')shield=6;else dash=Math.min(3,dash+1);score+=50;burst(p.x,p.y);powerups.splice(i,1);}}
    particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
    if(Math.random()<dt*.45)spawnPower();
    draw();updateHud();
    if(elapsed>=45)finish(false);else raf=requestAnimationFrame(loop);
  }
  function draw(){
    const cx=w/2,cy=h/2,rad=stormRadius();ctx.clearRect(0,0,w,h);
    const bg=ctx.createRadialGradient(cx,cy,20,cx,cy,Math.max(w,h));bg.addColorStop(0,'#172554');bg.addColorStop(1,'#07111f');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(125,211,252,.09)';ctx.lineWidth=1;for(let x=0;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
    ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fillStyle='rgba(14,165,233,.08)';ctx.fill();ctx.strokeStyle='rgba(56,189,248,.65)';ctx.lineWidth=3;ctx.stroke();
    orbs.forEach(o=>{ctx.beginPath();ctx.arc(o.x,o.y,o.r+Math.sin(o.p)*2,0,Math.PI*2);ctx.fillStyle='#fbbf24';ctx.shadowBlur=16;ctx.shadowColor='#fbbf24';ctx.fill();ctx.shadowBlur=0});
    powerups.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.type==='shield'?'#22d3ee':'#a78bfa';ctx.fill();ctx.fillStyle='#fff';ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText(p.type==='shield'?'S':'D',p.x,p.y+4)});
    rivals.forEach(r=>{ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.fillStyle='#fb7185';ctx.fill();ctx.fillStyle='#fff';ctx.font='10px Arial';ctx.textAlign='center';ctx.fillText('R',r.x,r.y+3)});
    particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle='#fff';ctx.fillRect(p.x,p.y,3,3);ctx.globalAlpha=1});
    ctx.beginPath();ctx.arc(player.x,player.y,player.r+(shield>0?4:0),0,Math.PI*2);ctx.fillStyle='#34d399';ctx.shadowBlur=18;ctx.shadowColor='#34d399';ctx.fill();ctx.shadowBlur=0;if(shield>0){ctx.strokeStyle='#67e8f9';ctx.lineWidth=2;ctx.stroke()}
  }
  async function finish(won){
    if(!running)return;running=false;cancelAnimationFrame(raf);draw();
    if(won)score+=500; score=Math.max(0,Math.round(score));
    try{ if(typeof saved!=='undefined'){window.score=Math.max(Number(window.score)||0,0); window.score += score; if(typeof best!=='undefined')best=Math.max(best,score); if(typeof save==='function')save(); if(typeof refreshStats==='function')refreshStats();} }catch(e){}
    try{ if(typeof currentUser!=='undefined'&&currentUser&&typeof supabaseClient!=='undefined'&&supabaseClient){await supabaseClient.from('game_attempts').insert({user_id:currentUser.id,category:'arena_rush',score,correct_answers:energy,total_questions:10});} if(typeof loadLeaderboard==='function')loadLeaderboard(); }catch(e){console.warn('Arena Rush cloud save failed:',e)}
    statusEl.textContent=won?'🏆 Arena cleared! +500 victory bonus':'⏱️ Time up! Run complete';
    document.getElementById('arenaResult').innerHTML=`<b>${won?'🏆 Victory!':'⚡ Run complete!'}</b><br>Score: <b>${score}</b> pts · Energy: <b>${energy}/10</b>`;
    document.getElementById('arenaResult').classList.remove('hidden');
  }
  window.startArenaRush=()=>{modal.classList.remove('hidden');document.getElementById('arenaResult').classList.add('hidden');reset()};
  window.closeArenaRush=()=>{running=false;cancelAnimationFrame(raf);modal.classList.add('hidden')};
})();
