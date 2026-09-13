(function(){
  function setup(){
    const box=document.querySelector('#auth .box');
    const action=document.getElementById('authAction');
    const password=document.getElementById('authPassword');
    const email=document.getElementById('authEmail');
    const status=document.getElementById('profileStatus');
    if(!box||!action||!password||!email||document.getElementById('forgotPassword'))return;
    const btn=document.createElement('button');
    btn.id='forgotPassword';btn.type='button';btn.textContent='Forgot password?';
    btn.style.marginTop='8px';btn.style.width='100%';
    btn.onclick=async function(){
      const address=email.value.trim();
      if(!address){status.textContent='⚠️ Enter your email address first.';return;}
      if(!window.challengeArenaSupabase){status.textContent='❌ Account service unavailable.';return;}
      btn.disabled=true;status.textContent='Sending password reset email…';
      try{
        const redirect=location.origin+location.pathname;
        const {error}=await window.challengeArenaSupabase.auth.resetPasswordForEmail(address,{redirectTo:redirect});
        if(error)throw error;
        status.textContent='✅ Reset email sent. Check your inbox and follow the link to create a new password.';
      }catch(e){status.textContent='❌ '+(e.message||'Could not send reset email.');}
      finally{btn.disabled=false;}
    };
    action.insertAdjacentElement('afterend',btn);
    const sync=()=>{const signin=document.getElementById('authTitle')?.textContent?.includes('Sign in');btn.classList.toggle('hidden',!signin||!!window.challengeArenaCurrentUser);};
    new MutationObserver(sync).observe(document.getElementById('authTitle'),{childList:true,subtree:true,characterData:true});
    sync();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();