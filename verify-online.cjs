const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/online.js','utf8');
function setup(fetch){const ctx={URL,fetch};vm.createContext(ctx);vm.runInContext(source,ctx);return ctx.GeneralLookup;}
(async()=>{
 let calls=[];const api=setup(async url=>{calls.push(String(url));return {ok:true,json:async()=>({responseStatus:200,responseData:{translatedText:'I helped.'}})};});
 assert.equal((await api.lookup('도왔다')).word,'I helped.');assert(new URL(calls[0]).searchParams.get('langpair')==='ko|en');
 await api.lookup('도왔다');assert.equal(calls.length,1);
 const english=setup(async url=>{assert.equal(new URL(url).searchParams.get('langpair'),'en|ko');return {ok:true,json:async()=>({responseStatus:200,responseData:{translatedText:'재미'}})};});
 assert.equal((await english.lookup('fun')).meaning,'재미');
 const quota=setup(async()=>({ok:true,json:async()=>({responseStatus:403,quotaFinished:true})}));await assert.rejects(quota.lookup('new'),/한도/);
 const failure=setup(async()=>({ok:false}));await assert.rejects(failure.lookup('new'),/연결/);
 const identity=setup(async()=>({ok:true,json:async()=>({responseStatus:200,responseData:{translatedText:'unknown'}})}));await assert.rejects(identity.lookup('unknown'),/찾지 못/);
 console.log('General translation: Korean/English direction, cache, quota, network, and missing translation checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
