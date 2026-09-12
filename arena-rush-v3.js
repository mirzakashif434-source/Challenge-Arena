(() => {
  const modal = document.getElementById('arenaRush');
  if (!modal || document.getElementById('arenaV3Panel')) return;

  const panel = document.createElement('div');
  panel.id = 'arenaV3Panel';
  panel.className = 'arena-v2-panel';
  panel.innerHTML = '<div class="arena-v2-mission"><b>🔥 Next Round</b><span id="arenaV3Hint">Finish a run to unlock your next mission.</span></div><button id="arenaV3Next" class="start hidden" type="button">🔥 Play Next Round →</button>';
  const box = modal.querySelector('.arena-box');
  const help = box && box.querySelector('.arena-help');
  if (box) box.insertBefore(panel, help || null);

  const next = document.getElementById('arenaV3Next');
  const hint = document.getElementById('arenaV3Hint');
  let round = Number(localStorage.getItem('challengeArenaRound') || 1);

  function showRound(){
    if(hint) hint.textContent = `Round ${round} • Collect 10 cores and beat your previous score.`;
  }
  if(next) next.addEventListener('click', () => {
    round += 1;
    localStorage.setItem('challengeArenaRound', String(round));
    next.classList.add('hidden');
    showRound();
    if(typeof window.startArenaRush === 'function') window.startArenaRush();
  });
  window.addEventListener('arenaRushFinished', (e) => {
    const d=e.detail||{};
    if(next){ next.classList.remove('hidden'); next.textContent = d.won ? '🔥 Play Next Round →' : '⚡ Try Again →'; }
    if(hint) hint.textContent = d.won ? `Round ${round} cleared! Beat ${Number(d.score)||0} pts next time.` : `Round ${round} complete. Try again and improve your score.`;
  });
  showRound();
})();
