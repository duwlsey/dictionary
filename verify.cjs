const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);for(const f of ['data.js','examples.js','search.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+f,'utf8'),ctx);
const cases=[['medecine','medicine'],['medicne','medicine'],['empaty','empathy'],['emphaty','empathy'],['엠파시','empathy'],['사라마','Sarama'],['뿌듯하다','proud'],['친구를 도와주다','help a friend'],['우무간다','Umuganda'],['쓰레기 줍기','pick up litter'],['결말을 왜 바꿨어','Why did you change the ending?'],['약 영어로','medicine'],['bleeding','bleed'],['children','child'],['prayed','pray'],['support','support'],['the','the'],['carry','carry'],['medical delivery drones','medical delivery drones'],['I can help by','I can help by']];
for(const [q,expected]of cases){const r=ctx.DictionarySearch.search(q);assert.equal(r.items[0]?.word,expected,q);}
assert.equal(ctx.DictionarySearch.search('zxqv999').items.length,0);assert.equal(ctx.DictionarySearch.search('').items.length,0);
assert(ctx.DictionarySearch.search('What does the drone carry?').sentences.length>0);
assert(ctx.DictionarySearch.search('<script>alert(1)</script>').items.every(e=>e.score<900));
assert.equal(new Set(ctx.WORDS.map(e=>e.word.toLowerCase())).size,ctx.WORDS.length);
console.log(`${cases.length+5} search checks passed; ${ctx.WORDS.length} entries, ${ctx.EXAMPLES.length} contextual examples.`);
