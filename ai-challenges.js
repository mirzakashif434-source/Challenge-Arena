(function(){
  const box=document.createElement('section');
  box.className='leader';
  box.id='aiChallengeCenter';
  box.innerHTML='<h2>🤖 AI Challenge</h2><p id="aiChallengeStatus">Generate a fresh challenge set automatically.</p><button class="start" id="aiChallengeBtn">Generate Challenge →</button>';
  const main=document.querySelector('main');
  if(main) main.insertBefore(box, main.querySelector('.leader'));

  const btn=box.querySelector('#aiChallengeBtn');
  const status=box.querySelector('#aiChallengeStatus');

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
    const seed=Date.now();
    return Array.from({length:5},(_,i)=>sets[(seed+i)%sets.length]);
  }

  function openQuiz(questions,title){
    let i=0,correct=0,score=0;
    const modal=document.createElement('div'); modal.className='modal'; modal.id='aiChallengeModal';
    modal.innerHTML='<div class="box"><button class="x" id="aiClose">×</button><div id="aiProgress"></div><h2>🤖 '+title+'</h2><p id="aiQuestion"></p><div id="aiAnswers"></div><p id="aiFeedback"></p><button id="aiNext" class="start hidden">Next →</button></div>';
    document.body.appendChild(modal);
    const progress=modal.querySelector('#aiProgress'),question=modal.querySelector('#aiQuestion'),answers=modal.querySelector('#aiAnswers'),feedback=modal.querySelector('#aiFeedback'),next=modal.querySelector('#aiNext');
    function render(){
      const q=questions[i]; progress.textContent='Question '+(i+1)+' of '+questions.length; question.textContent=q[0]; feedback.textContent=''; next.classList.add('hidden');
      answers.innerHTML=q[1].map((v,n)=>'<button class="answer">'+v+'</button>').join('');
      answers.querySelectorAll('button').forEach((b,n)=>b.onclick=()=>answer(n));
    }
    function answer(n){
      const q=questions[i]; answers.querySelectorAll('button').forEach(b=>b.disabled=true);
      if(n===q[2]){correct++;score+=100;feedback.textContent='✅ Correct! +100 points';}else feedback.textContent='❌ Correct answer: '+q[1][q[2]];
      next.textContent=i===questions.length-1?'Finish →':'Next →'; next.classList.remove('hidden');
    }
    next.onclick=()=>{if(i<questions.length-1){i++;render();}else{question.textContent='🎉 AI Challenge Complete';progress.textContent='Finished';answers.innerHTML='';feedback.textContent='Score: '+score+' points · '+correct+'/'+questions.length+' correct';next.classList.add('hidden');}};
    modal.querySelector('#aiClose').onclick=()=>modal.remove();
    render();
  }

  async function generate(){
    btn.disabled=true; status.textContent='🤖 Generating a fresh challenge…';
    try{
      const client=window.challengeArenaSupabase;
      if(client&&client.functions){
        const {data,error}=await client.functions.invoke('generate-challenge');
        if(!error&&data&&Array.isArray(data.questions)&&data.questions.length){
          status.textContent='✅ Fresh AI challenge ready.'; openQuiz(data.questions.slice(0,5),'AI Challenge'); return;
        }
      }
      status.textContent='⚡ Automatic challenge ready. AI backend can be connected securely later.';
      openQuiz(fallbackSet(),'Automatic Challenge');
    }catch(e){
      status.textContent='⚡ Automatic challenge ready.'; openQuiz(fallbackSet(),'Automatic Challenge');
    }finally{btn.disabled=false;}
  }
  btn.addEventListener('click',generate);
})();