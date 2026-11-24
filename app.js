const $=s=>document.querySelector(s);
const results=$('#results'),query=$('#query');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeResult=null,limit=5,timer;
const speakerIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
function exampleFor(word){const exact=EXAMPLES.filter(ex=>new RegExp('(^| )'+word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'( |$)','i').test(ex[0]));return exact[0];}
function card(e){const ex=exampleFor(e.word);return `<article class="result-card"><div class="word-top"><div><span class="badge ${e.source==='活動 확장'||e.source==='활동 확장'?'extension':''}">${esc(e.source)}${e.grades.length?' · '+esc(e.grades.join(' / ')):''}</span><h2 class="word-title" lang="en">${esc(e.word)}</h2></div><button class="speak" data-speak="${esc(e.word)}" aria-label="${esc(e.word)} 발음 듣기">${speakerIcon}</button></div><p class="meaning">${esc(e.meaning)}</p>${e.reason==='typo'?'<p class="match-note">철자가 조금 달라도, 이 단어를 찾았어요.</p>':''}${ex?`<div class="example"><span class="example-label">${esc(ex[3])}</span><p class="example-en" lang="en">${esc(ex[1])}</p><p class="example-ko">${esc(ex[2])}</p></div>`:''}</article>`;}
function render(){const {items,sentences,query:q}=activeResult;$('#welcome').hidden=true;document.body.classList.add('has-results');
 const best=items[0];let heading=best&&best.score>=900?'찾았어요':best?'이 단어를 찾고 있나요?':'아직 딱 맞는 단어를 찾지 못했어요';
 results.innerHTML=`<div class="result-head"><span>${heading}${items.length?' · '+items.length+'개':''}</span><button data-reset>검색 지우기</button></div>`;
 results.innerHTML+=sentences.map(ex=>`<div class="sentence-match"><small>관련 표현 · ${esc(ex[3])}</small><p lang="en">${esc(ex[1])}</p><p>${esc(ex[2])}</p></div>`).join('');
 if(items.length)results.innerHTML+=items.slice(0,limit).map(card).join('')+(items.length>limit?'<button class="result-more" data-more>관련 단어 더 보기</button>':'');
 else results.innerHTML+=`<div class="empty"><h2>조금 더 짧게 찾아볼까?</h2><p>“${esc(q)}”와 맞는 단어가 아직 없어요.<br>긴 질문 대신 핵심 단어나 짧은 우리말로 찾아봐.<br>예: “친구를 도와주다”, “걱정”, “드론”</p><button data-query="친구를 도와주다">친구를 도와주다</button><button data-query="감정">감정</button><button data-query="드론">드론</button></div>`;
 results.innerHTML+='<p class="related-line">워크북 단어와 미리 준비한 활동 표현에서 찾아요. 예문은 내 생각에 맞게 바꿔 써봐.</p>';
}
function run(value,updateUrl=true){query.value=value;const q=value.trim();clearTimeout(timer);if(!q){reset(updateUrl);return;}limit=5;activeResult=DictionarySearch.search(q);render();if(updateUrl){const u=new URL(location.href);u.searchParams.set('q',q);history.replaceState(null,'',u);}}
function reset(updateUrl=true){query.value='';results.innerHTML='';$('#welcome').hidden=false;document.body.classList.remove('has-results');if(updateUrl){const u=new URL(location.href);u.searchParams.delete('q');history.replaceState(null,'',u);}query.focus();}
$('#search-form').addEventListener('submit',e=>{e.preventDefault();run(query.value);});
query.addEventListener('input',e=>{clearTimeout(timer);if(!e.isComposing)timer=setTimeout(()=>run(query.value),220);});
query.addEventListener('compositionend',()=>{clearTimeout(timer);timer=setTimeout(()=>run(query.value),180);});
query.addEventListener('keydown',e=>{if(e.key==='Escape')reset();});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.query!==undefined){run(b.dataset.query);query.focus();}if(b.hasAttribute('data-reset'))reset();if(b.hasAttribute('data-more')){limit+=5;render();}if(b.dataset.speak){if(!('speechSynthesis'in window)){b.setAttribute('aria-label','이 브라우저는 발음 듣기를 지원하지 않아요');b.title='이 브라우저는 발음 듣기를 지원하지 않아요';return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(b.dataset.speak);u.lang='en-US';u.rate=.8;speechSynthesis.speak(u);}});
window.addEventListener('popstate',()=>{const q=new URL(location.href).searchParams.get('q');q?run(q,false):reset(false);});
const initial=new URL(location.href).searchParams.get('q');if(initial)run(initial,false);
