(function(){
  const box=document.createElement('section');
  box.className='leader';
  box.id='aiChallengeCenter';
  box.innerHTML='<h2>🤖 AI Challenge</h2><p id="aiChallengeStatus">Generate a fresh challenge set automatically.</p><button class="start" id="aiChallengeBtn">Generate Challenge →</button>';
  const main=document.querySelector('main');
  if(main) main.insertBefore(box, main.querySelector('.leader'));
  const btn=box.querySelector('#aiChallengeBtn');
  const status=box.querySelector('#aiChallengeStatus');
  const escapeText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function fallbackSet(){
    const sets=[
      ['What is the largest planet in our solar system?',['Earth','Mars','Jupiter','Venus'],2],
      ['Which ocean is the largest?',['Atlantic','Indian','Pacific','Arctic'],2],
      ['How many sides does a pentagon have?',['4','5','6','7'],1],
      ['Which animal is the fastest on land?',['Lion','Cheetah','Horse','Tiger'],1],
      ['What is 15 + 27?',['32','40','42','45'],2],
      ['Which planet is known as the Red Planet?',['Venus','Mars','Jupiter','Mercury'],1],
      ['How many days are in a leap year?',['364','365','366','367'],2],
      ['Which shape has three sides?',['Square','Circle','Triangle','Hexagon'],2]
    ];
    const seed=Math.floor(Date.now()/86400000);
    return Array.from({length:5},(_,i)=>sets[(seed+i)%sets.length]);
  }
  function normalizeQuestions(value){
    if(!Array.isArray(value)) return [];
    return value.map(q=>{
      if(Array.isArray(q)) return [String(q[0]??''),Array.isArray(q[1])?q[1].map(String):[],Number(q[2])];
      if(q&&typeof q==='object') return [String(q.question??''),Array.isArray(q.options)?q.options.map(String):[],Number(q.answer)];
      return null;
    }).filter(q=>q&&q[0]&&Array.isArray(q[1])&&q[1].length===4&&Number.isInteger(q[2])&&q[2]>=0&&q[2]<4).slice(0,5);
  }
  function openQuiz(questions,title){
    const clean=normalizeQuestions(questions);
    if(!clean.length){status.textContent='⚠️ No valid challenge was returned. Try again.';return;}
    let i=0,correct=0,score=0;
    const modal=document.createElement('div');modal.className='modal';modal.id='aiChallengeModal';
    modal.innerHTML='<div class="box"><button class="x" id="aiClose">×</button><div id="aiProgress"></div><h2>🤖 '+escapeText(title)+'</h2><p id="aiQuestion"></p><div id="aiAnswers"></div><p id="aiFeedback"></p><button id="aiNext" class="start hidden">Next →</button></div>';
    document.body.appendChild(modal);
    const progress=modal.querySelector('#aiProgress'),question=modal.querySelector('#aiQuestion'),answers=modal.querySelector('#aiAnswers'),feedback=modal.querySelector('#aiFeedback'),next=modal.querySelector('#aiNext');
    function render(){const q=clean[i];progress.textContent='Question '+(i+1)+' of '+clean.length;question.textContent=q[0];feedback.textContent='';next.classList.add('hidden');answers.innerHTML='';q[1].forEach(v=>{const b=document.createElement('button');b.className='answer';b.textContent=String(v);b.onclick=()=>answer(Array.from(answers.children).indexOf(b));answers.appendChild(b);});}
    function answer(n){const q=clean[i];answers.querySelectorAll('button').forEach(b=>b.disabled=true);if(n===q[2]){correct++;score+=100;feedback.textContent='✅ Correct! +100 points';}else feedback.textContent='❌ Correct answer: '+String(q[1][q[2]]);next.textContent=i===clean.length-1?'Finish →':'Next →';next.classList.remove('hidden');}
    next.onclick=()=>{if(i<clean.length-1){i++;render();}else{question.textContent='🎉 AI Challenge Complete';progress.textContent='Finished';answers.innerHTML='';feedback.textContent='Score: '+score+' points · '+correct+'/'+clean.length+' correct';next.classList.add('hidden');if(typeof window.challengeArenaRecordExternalScore==='function')window.challengeArenaRecordExternalScore(score,correct,clean.length,'ai');status.textContent=window.challengeArenaCurrentUser?'✅ AI challenge complete. Score synced to your account.':'✅ AI challenge complete. Sign in to sync your score.';}};
    modal.querySelector('#aiClose').onclick=()=>modal.remove();render();
  }
  async function generate(){
    btn.disabled=true;status.textContent='🤖 Generating a fresh challenge…';
    try{
      const client=window.challengeArenaSupabase;
      if(!client||!client.functions)throw new Error('AI service unavailable');
      const {data,error}=await client.functions.invoke('generate-challenge');
      if(error)throw error;
      const questions=normalizeQuestions(data?.questions);
      if(!questions.length)throw new Error('Invalid AI response');
      status.textContent='✅ Fresh AI challenge ready.';
      openQuiz(questions,data?.title||'AI Challenge');
    }catch(e){
      console.warn('AI challenge generation failed:',e?.message||e);
      status.textContent='⚠️ AI service is unavailable right now. Please try again.';
    }finally{btn.disabled=false;}
  }
  btn.addEventListener('click',generate);
})();