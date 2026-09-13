(function(){
  const KEY='challengeArenaVisitorId';
  const SESSION_KEY='challengeArenaSessionId';
  function id(){let v=localStorage.getItem(KEY);if(!v){v=crypto.randomUUID();localStorage.setItem(KEY,v)}return v}
  function sid(){let v=sessionStorage.getItem(SESSION_KEY);if(!v){v=crypto.randomUUID();sessionStorage.setItem(SESSION_KEY,v)}return v}
  async function ping(){const c=window.challengeArenaSupabase;if(!c)return;try{await c.rpc('record_visitor_visit',{p_visitor_id:id(),p_session_id:sid(),p_user_agent:navigator.userAgent})}catch(e){console.warn('Visitor tracking unavailable:',e?.message||e)}}
  ping();setInterval(ping,60000);
})();