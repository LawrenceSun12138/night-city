(() => {
  const storage = {get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  function setTheme(theme){
    document.body.dataset.theme=theme;
    themeButtons.forEach(button=>{const dark=theme==='dark';button.setAttribute('aria-label',dark?'切换到日间模式':'切换到夜间模式');button.setAttribute('aria-pressed',String(dark));button.querySelector('.theme-label').textContent=dark?'日间模式':'夜间模式';button.querySelector('.theme-icon').textContent=dark?'☀':'☾'});
    storage.set('sange.theme',theme);
  }
  setTheme(storage.get('sange.theme')==='dark'?'dark':'light');
  themeButtons.forEach(button=>button.addEventListener('click',()=>setTheme(document.body.dataset.theme==='dark'?'light':'dark')));
  const chapter=document.body.dataset.chapter;
  let saved=null;
  try{saved=JSON.parse(storage.get('sange.reading')||'null')}catch{}
  const knownChapters=JSON.parse(document.getElementById('chapter-index').textContent);
  if(saved && !knownChapters[saved.chapter]) saved=null;
  const continueLink=document.getElementById('continue-reading');
  if(continueLink && saved && saved.progress>.02){continueLink.hidden=false;continueLink.href=knownChapters[saved.chapter]+'?resume=1';}
  if(!chapter)return;
  const min=16,max=28;
  let size=Number(storage.get('sange.font'))||20;
  size=Math.min(max,Math.max(min,size));
  const smaller=document.getElementById('font-smaller'),larger=document.getElementById('font-larger'),output=document.getElementById('font-size');
  function setSize(value){size=value;document.documentElement.style.setProperty('--reader-size',size+'px');output.textContent=size+' px';smaller.disabled=size<=min;larger.disabled=size>=max;storage.set('sange.font',String(size));updateProgress(false);}
  smaller.addEventListener('click',()=>setSize(Math.max(min,size-2)));
  larger.addEventListener('click',()=>setSize(Math.min(max,size+2)));
  const prose=document.querySelector('.prose'),bar=document.querySelector('.progress-bar');
  function getRange(){const top=prose.getBoundingClientRect().top+window.scrollY;return {top,total:Math.max(1,prose.offsetHeight-window.innerHeight*.55)}}
  function updateProgress(save=true){const {top,total}=getRange();const progress=Math.max(0,Math.min(1,(window.scrollY-top+100)/total));bar.style.width=progress*100+'%';if(save)storage.set('sange.reading',JSON.stringify({chapter,progress}));}
  function resume(){if(!saved || saved.chapter!==chapter)return;const{top,total}=getRange();window.scrollTo({top:Math.max(0,top+total*Math.min(1,Math.max(0,saved.progress))-100),behavior:'instant'});document.getElementById('resume-panel').hidden=true;}
  setSize(size);
  if(saved && saved.chapter===chapter && saved.progress>.02){const panel=document.getElementById('resume-panel');panel.hidden=false;document.getElementById('resume-percent').textContent=Math.round(saved.progress*100)+'%';document.getElementById('resume-button').addEventListener('click',resume);document.getElementById('resume-dismiss').addEventListener('click',()=>panel.hidden=true);if(new URLSearchParams(location.search).has('resume'))requestAnimationFrame(()=>requestAnimationFrame(resume));}
  let ticking=false;window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateProgress();ticking=false});ticking=true}},{passive:true});
  window.addEventListener('resize',()=>updateProgress(false));
})();
