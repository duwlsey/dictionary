// General lookup is separate from the reviewed workbook dictionary.
(function(root){
 const cache=new Map();
 async function lookup(input,{signal}={}){
  const q=input.trim();if(!q||q.length>180)throw Error('짧은 단어나 표현으로 찾아봐.');
  const korean=/[가-힣]/.test(q);const key=(korean?'ko':'en')+':'+q.toLowerCase();
  if(cache.has(key))return cache.get(key);
  const u=new URL('https://api.mymemory.translated.net/get');u.searchParams.set('q',q);u.searchParams.set('langpair',korean?'ko|en':'en|ko');
  const response=await fetch(u,{signal});if(!response.ok)throw Error('일반 검색에 연결하지 못했어요. 잠시 후 다시 찾아봐.');
  const data=await response.json();
  if(Number(data.responseStatus)!==200||data.quotaFinished)throw Error('일반 검색의 이용 한도에 도달했어요. 나중에 다시 찾아봐.');
  // Decode provider text as text only; the UI separately escapes all output.
  const raw=data.responseData?.translatedText;if(typeof raw!=='string'||!raw.trim()||raw.toLowerCase()===q.toLowerCase())throw Error('일반 검색에서도 뜻을 찾지 못했어요. 다른 말로 찾아봐.');
  const translated=raw.replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  const result={word:korean?translated:q,meaning:korean?q:translated,source:'일반 번역 · MyMemory',grades:[],reason:'online',score:900};cache.set(key,result);return result;
 }
 root.GeneralLookup={lookup};
})(globalThis);
