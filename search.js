(function(root){
 const norm=s=>s.toLowerCase().normalize('NFKC').replace(/[’‘]/g,"'").replace(/[^a-z0-9가-힣]/g,'');
 function distance(a,b){let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]!==b[j-1]));prev=row;}return prev[b.length];}
 const generic=new Set('i you he she it we they a an the is am are was were be been do does did to of in on at for and but or my your his her our their me him them can will how what why when where that this with have has had by'.split(' '));
 const koFiller=/영어로|영어는|영어|뜻이뭐야|무슨뜻이야|무슨뜻|뜻알려줘|알려줘|뜻이야|뜻은|뜻|뭐야|뭔가요|뭐예요|무엇인가요|뭐라고해|뭐라고하지|어떻게써|어떻게말해|번역해줘|번역|해석해줘|해석|하고싶어요|하고싶어|라고쓰고싶어|라고해/g;
 function search(query,words=root.WORDS,examples=root.EXAMPLES){
  const input=query.trim();if(!input)return {items:[],sentences:[],query:input};
  const q=norm(input.replace(koFiller,''));if(!q)return {items:[],sentences:[],query:input};
  const latinTokens=(input.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[]).filter(t=>!generic.has(t)&&t.length>1);
  const items=words.map(e=>{
   const w=norm(e.word),aliases=e.aliases.map(norm),meanings=e.meaning.split(/[;；,，]/).map(norm);
   let score=0,reason='';
   if(q===w){score=1000;reason='exact';}
   else if(aliases.includes(q)){score=980;reason='alias';}
   else if(meanings.includes(q)){score=960;reason='meaning';}
   else if(w.startsWith(q)&&q.length>=2){score=790-q.length/w.length;reason='partial';}
   else if(aliases.some(a=>a.startsWith(q)&&q.length>=2)){score=760;reason='alias';}
   else if(meanings.some(m=>m.includes(q))&&q.length>=2){score=720;reason='meaning';}
   else if(q.length>=3&&w.length>=3){const d=distance(q,w);const max=q.length<5?1:q.length<10?2:Math.floor(q.length*.22);if(d<=max){score=650-d*60;reason='typo';}}
   // Match phrases within a student's question without letting tiny function words dominate.
   if(!score&&q.length>=3){const keys=[w,...aliases,...meanings].filter(k=>k.length>=(/[가-힣]/.test(k)?2:3));const hit=keys.find(k=>q.includes(k));if(hit){score=430+Math.min(hit.length,30)*4;reason='context';}}
   if(!score&&latinTokens.length>1&&latinTokens.includes(w)&&!generic.has(w)){score=450+w.length;reason='context';}
   return {...e,score,reason};
  }).filter(e=>e.score>0).sort((a,b)=>b.score-a.score||(a.source==='워크북'?-1:1)-(b.source==='워크북'?-1:1)||a.word.length-b.word.length);
  const top=items[0];
  // Contextual sentence suggestions only, never claim an arbitrary free-text translation.
  const sentences=examples.map(ex=>{
   const en=norm(ex[1]),ko=norm(ex[2]);let s=en===q||ko===q?1000:en.includes(q)&&q.length>=5?800:ko.includes(q)&&q.length>=3?750:0;
   if(top&&top.score>=600&&ex[0].toLowerCase().split(' ').includes(top.word.toLowerCase()))s=Math.max(s,300);
   return {example:ex,score:s};
  }).filter(e=>e.score>=700).sort((a,b)=>b.score-a.score).slice(0,2).map(e=>e.example);
  return {items,sentences,query:input};
 }
 root.DictionarySearch={search,norm,distance};
})(globalThis);
