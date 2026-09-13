(function(){
  const wrap=document.createElement('section');
  wrap.className='leader';
  wrap.id='adminPanel';
  wrap.innerHTML='<h2>🛠️ Admin Panel</h2><p id="adminStatus">Admin access is protected.</p><button class="start" id="adminOpen">Open Admin Dashboard →</button>';
  const main=document.querySelector('main'); if(main) main.appendChild(wrap);

  const modal=document.createElement('div'); modal.className='modal hidden'; modal.id='adminModal';
  modal.innerHTML='<div class="box"><button class="x" id="adminClose">×</button><h2>🛠️ Admin Dashboard</h2><div id="adminStats">Checking access…</div><h3>Recent accounts</h3><div id="adminUsers"></div><h3>Challenge controls</h3><p id="adminQuestions">Questions are protected by the database.</p></div>';
  document.body.appendChild(modal);
  const client=window.challengeArenaSupabase;
  const status=document.getElementById('adminStatus');
  const open=document.getElementById('adminOpen');
  async function dashboard(){
    if(!client){status.textContent='Admin service unavailable.';return;}
    status.textContent='Checking admin access…';
    const {data:{session}}=await client.auth.getSession();
    if(!session){status.textContent='🔒 Sign in first. Admin access is restricted.';return;}
    const {data,error}=await client.rpc('admin_dashboard');
    if(error||!data){status.textContent='🔒 Admin access denied.';return;}
    status.textContent='✅ Secure admin access enabled.';
    document.getElementById('adminStats').innerHTML='<div class="stats"><div><b>'+Number(data.users||0)+'</b><span>Users</span></div><div><b>'+Number(data.attempts||0)+'</b><span>Attempts</span></div><div><b>'+Number(data.points||0)+'</b><span>Total Points</span></div></div><p>Today attempts: <b>'+Number(data.today_attempts||0)+'</b> · Active questions: <b>'+Number(data.active_questions||0)+'</b></p>';
    document.getElementById('adminUsers').innerHTML=(data.latest_users||[]).map(u=>'<div class="row"><b>'+escapeHtml(u.display_name||'Player')+'</b><span>'+new Date(u.updated_at).toLocaleDateString()+'</span></div>').join('')||'<p>No users yet.</p>';
    document.getElementById('adminQuestions').textContent='Active question count: '+Number(data.active_questions||0)+'. Question enable/disable controls are enforced server-side.';
    modal.classList.remove('hidden');
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  open.onclick=dashboard;
  document.getElementById('adminClose').onclick=()=>modal.classList.add('hidden');
})();