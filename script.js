// ---------- Theme Switcher ----------
const themeSelect = document.getElementById('themeSelect');
document.body.setAttribute('data-theme', localStorage.getItem('stm_theme') || 'default');
themeSelect.value = localStorage.getItem('stm_theme') || 'default';
themeSelect.addEventListener('change', () => {
  const theme = themeSelect.value;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('stm_theme', theme);
});

// ---------- Notes ----------
let notes = JSON.parse(localStorage.getItem('stm_notes')||'[]');
const notesListEl=document.getElementById('notesList');
const noteTitle=document.getElementById('noteTitle');
const noteText=document.getElementById('noteText');

document.getElementById('addNoteBtn').addEventListener('click',()=>{
  const t=noteTitle.value.trim(), c=noteText.value.trim(); 
  if(!t&&!c)return; 
  notes.unshift({title:t,text:c,created:new Date().toISOString()}); 
  saveNotes(); renderNotes(); noteTitle.value=''; noteText.value='';
});
document.getElementById('clearNotes').addEventListener('click',()=>{
  if(confirm('Clear all notes?')){notes=[];saveNotes();renderNotes();}
});
function saveNotes(){localStorage.setItem('stm_notes',JSON.stringify(notes));}
function renderNotes(){
  notesListEl.innerHTML='';
  notes.forEach((n,i)=>{
    const card=document.createElement('div'); card.className='item';
    card.innerHTML=`<input type="text" class="note-title" value="${n.title}" placeholder="Title"/>
    <textarea class="note-text">${n.text}</textarea>
    <div class="panel-actions"><button class="ghost del-note">Delete</button></div>`;
    card.querySelector('.note-title').addEventListener('input',e=>{notes[i].title=e.target.value; saveNotes();});
    card.querySelector('.note-text').addEventListener('input',e=>{notes[i].text=e.target.value; saveNotes();});
    card.querySelector('.del-note').addEventListener('click',()=>{notes.splice(i,1); saveNotes(); renderNotes();});
    notesListEl.appendChild(card);
  });
}
renderNotes();

// ---------- Tasks ----------
let tasks = JSON.parse(localStorage.getItem('stm_tasks')||'[]');
tasks = tasks.map(t => t.completed ? t : {...t, completed:false});
const tasksListEl=document.getElementById('tasksList');
const taskName=document.getElementById('taskName');
const taskSubject=document.getElementById('taskSubject');
const taskDeadline=document.getElementById('taskDeadline');
const taskCategory=document.getElementById('taskCategory');
const taskLabel=document.getElementById('taskLabel');

document.getElementById('addTaskBtn').addEventListener('click',()=>{
  const name=taskName.value.trim(); 
  if(!name||!taskDeadline.value) return;
  tasks.unshift({name,subject:taskSubject.value,deadline:taskDeadline.value,category:taskCategory.value,label:taskLabel.value,created:new Date().toISOString(), completed:false});
  saveTasks(); renderTasks(); taskName.value=''; taskSubject.value=''; taskDeadline.value=''; taskCategory.value=''; taskLabel.value='';
});

document.getElementById('clearTasks').addEventListener('click',()=>{if(confirm('Clear all tasks?')){tasks=[]; saveTasks(); renderTasks();}});
function saveTasks(){localStorage.setItem('stm_tasks',JSON.stringify(tasks));}

function renderTasks(showCompleted=false){
  tasksListEl.innerHTML='';
  tasks.forEach((t,i)=>{
    if(showCompleted && !t.completed) return;
    if(!showCompleted && t.completed) return;
    const card=document.createElement('div'); 
    card.className='item';
    if(t.completed){card.style.opacity='0.6';card.style.textDecoration='line-through';} 
    else{card.style.opacity='1';card.style.textDecoration='none';}
    card.innerHTML=`<input type="text" class="task-name" value="${t.name}" ${t.completed?'readonly':''}/>
      <input type="text" class="task-subject" value="${t.subject}" ${t.completed?'readonly':''}/>
      <input type="date" class="task-deadline" value="${t.deadline}" ${t.completed?'readonly':''}/>
      <select class="task-category" ${t.completed?'disabled':''}>
        <option value="">Category</option>
        <option ${t.category==='Major'?'selected':''}>Major</option>
        <option ${t.category==='Core'?'selected':''}>Core</option>
        <option ${t.category==='Minor'?'selected':''}>Minor</option>
        <option ${t.category==='Gen-Ed'?'selected':''}>Gen-Ed</option>
      </select>
      <select class="task-label" ${t.completed?'disabled':''}>
        <option value="">Label</option>
        <option ${t.label==='Academics'?'selected':''}>Academics</option>
        <option ${t.label==='Personal'?'selected':''}>Personal</option>
        <option ${t.label==='Work'?'selected':''}>Work</option>
      </select>
      <div class="panel-actions">
        <button class="ghost del-task">Delete</button>
        <button class="ghost toggle-complete">${t.completed?'Undo':'Complete'}</button>
      </div>`;
    card.querySelector('.task-name')?.addEventListener('input',e=>{tasks[i].name=e.target.value; saveTasks();});
    card.querySelector('.task-subject')?.addEventListener('input',e=>{tasks[i].subject=e.target.value; saveTasks();});
    card.querySelector('.task-deadline')?.addEventListener('input',e=>{tasks[i].deadline=e.target.value; saveTasks();});
    card.querySelector('.task-category')?.addEventListener('change',e=>{tasks[i].category=e.target.value; saveTasks();});
    card.querySelector('.task-label')?.addEventListener('change',e=>{tasks[i].label=e.target.value; saveTasks();});
    card.querySelector('.del-task').addEventListener('click',()=>{tasks.splice(i,1); saveTasks(); renderTasks(showCompleted);});
    card.querySelector('.toggle-complete').addEventListener('click',()=>{tasks[i].completed=!tasks[i].completed; saveTasks(); renderTasks(showCompleted);});
    tasksListEl.appendChild(card);
  });
}

function showHome(){ renderTasks(false); }
function showCompletedTasks(){ renderTasks(true); }
renderTasks();

// ---------- Flashcards ----------
let deck = JSON.parse(localStorage.getItem('stm_deck') || '[]');
let currentCard = 0; let showingAnswer = false;
const cardView = document.getElementById('cardView');
const cardProg = document.getElementById('cardProg');
const cardCount = document.getElementById('cardCount');
const fsCardOverlay = document.getElementById('fsCardOverlay');
const fsCard = document.getElementById('fsCardInner');
const fsCardFront = document.getElementById('fsCardFront');
const fsCardBack = document.getElementById('fsCardBack');
const fsCardToggle = document.getElementById('fsCardToggle');
const fsCardClose = document.getElementById('fsCardClose');
const fsNextCardBtn = document.getElementById('fsNextCardBtn');
const fsPrevCardBtn = document.getElementById('fsPrevCardBtn');
const fsDeleteCardBtn = document.getElementById('fsDeleteCardBtn');
const deleteCardBtn = document.getElementById('deleteCard');

function saveDeck(){ localStorage.setItem('stm_deck', JSON.stringify(deck)); }

function renderCard(){
  if(!deck.length){ cardView.textContent='No deck'; cardCount.textContent='0 / 0'; cardProg.style.width='0%'; return; }
  const c=deck[currentCard];
  cardView.textContent=c.q;
  cardCount.textContent=`${currentCard+1} / ${deck.length}`;
  cardProg.style.width=`${((currentCard+1)/deck.length)*100}%`;
}

function openFullscreenCard(){ 
  if(!deck.length)return; 
  const c=deck[currentCard]; 
  fsCardFront.textContent=c.q; 
  fsCardBack.textContent=c.a; 
  fsCardOverlay.style.display='flex'; 
  fsCard.classList.remove('flipped'); 
  showingAnswer=false; 
  fsCardToggle.textContent='Show Answer'; 
}

function nextCard(){ if(!deck.length)return; currentCard=(currentCard<deck.length-1)?currentCard+1:0; renderCard(); }
function prevCard(){ if(!deck.length)return; currentCard=(currentCard>0)?currentCard-1:deck.length-1; renderCard(); }
function deleteCurrentCard(){ if(!deck.length)return; if(!confirm('Delete this flashcard?'))return; deck.splice(currentCard,1); if(currentCard>=deck.length)currentCard=deck.length-1; saveDeck(); renderCard(); fsCardOverlay.style.display='none'; }

document.getElementById('addCard').addEventListener('click',()=>{ const q=document.getElementById('cardQ').value.trim(); const a=document.getElementById('cardA').value.trim(); if(!q||!a)return; deck.push({q,a}); saveDeck(); currentCard=deck.length-1; renderCard(); document.getElementById('cardQ').value=''; document.getElementById('cardA').value='';});
document.getElementById('prevCard').addEventListener('click',prevCard);
document.getElementById('nextCard').addEventListener('click',nextCard);
deleteCardBtn.addEventListener('click',deleteCurrentCard);
cardView.addEventListener('click',openFullscreenCard);
fsCardToggle.addEventListener('click',()=>{ showingAnswer=!showingAnswer; if(showingAnswer){fsCard.classList.add('flipped'); fsCardToggle.textContent='Show Question';} else{fsCard.classList.remove('flipped'); fsCardToggle.textContent='Show Answer';}});
fsNextCardBtn.addEventListener('click',()=>{ nextCard(); openFullscreenCard(); });
fsPrevCardBtn.addEventListener('click',()=>{ prevCard(); openFullscreenCard(); });
fsDeleteCardBtn.addEventListener('click',deleteCurrentCard);
fsCardClose.addEventListener('click',()=>{ fsCardOverlay.style.display='none'; showingAnswer=false; fsCard.classList.remove('flipped'); });
renderCard();

// ---------- Pomodoro ----------
let pomTime=25*60; let pomInterval=null; const pomDisplay=document.getElementById('pomTimer'); const fsPomOverlay=document.getElementById('fsOverlay'); const fsTimer=document.getElementById('fsTimer');
function updatePomDisplay(){ const m=Math.floor(pomTime/60).toString().padStart(2,'0'); const s=(pomTime%60).toString().padStart(2,'0'); pomDisplay.textContent=`${m}:${s}`; fsTimer.textContent=`${m}:${s}`; }
function startPom(){ if(pomInterval)return; fsPomOverlay.style.display='flex'; pomInterval=setInterval(()=>{if(pomTime>0){pomTime--; updatePomDisplay();} else{clearInterval(pomInterval); pomInterval=null; alert('Pomodoro complete!');}},1000);}
function pausePom(){ clearInterval(pomInterval); pomInterval=null; }
function stopPom(){ clearInterval(pomInterval); pomInterval=null; pomTime=25*60; updatePomDisplay(); fsPomOverlay.style.display='none'; }
document.getElementById('startPom').addEventListener('click',startPom);
document.getElementById('pausePom').addEventListener('click',pausePom);
document.getElementById('stopPom').addEventListener('click',stopPom);
document.getElementById('fsStop').addEventListener('click',stopPom);
updatePomDisplay();
