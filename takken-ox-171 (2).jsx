import React, { useState, useEffect, useCallback } from 'react';
const CATS=[
{id:"all",label:"全セクション",icon:"📚"},
{id:"tochi",label:"1-1 宅地",icon:"🏞"},{id:"tatemono",label:"1-2 建物",icon:"🏢"},{id:"torihiki",label:"1-3 取引",icon:"🤝"},{id:"gyou",label:"1-4 業",icon:"💼"},{id:"jimusho",label:"1-5 事務所",icon:"🏠"},
{id:"menkyo",label:"2-1 免許申請・更新",icon:"📋"},{id:"kekka_ko",label:"2-2 欠格(個人)",icon:"👤"},{id:"kekka_ho",label:"2-3 欠格(法人)",icon:"🏛"},{id:"menkyokae",label:"2-6 免許換え",icon:"🔄"},{id:"minashi",label:"2-8 みなし業者",icon:"👻"},{id:"tokurei",label:"2-9 特例・除外",icon:"⚡"},{id:"mumenkyo",label:"2-10 無免許等",icon:"🚫"},{id:"todokede",label:"2-11 変更届出",icon:"📝"},{id:"haigyou",label:"2-12 廃業届出",icon:"📤"},
{id:"tk_def",label:"3-1 宅建士の定義",icon:"📖"},{id:"tk_kekka",label:"3-2 登録の欠格",icon:"🔒"},{id:"tk_touroku",label:"3-3~5 登録",icon:"✍️"},{id:"tk_todoke",label:"3-6 死亡等届出",icon:"📋"},{id:"tk_sho",label:"3-7~10 宅建士証",icon:"🪪"},{id:"tk_sennin",label:"3-11 専任宅建士",icon:"⭐"},
{id:"hosho_k",label:"4-1 営業保証金(供託)",icon:"💰"},{id:"hosho_t",label:"4-2 営業保証金(届出)",icon:"📑"},{id:"hosho_z",label:"4-3 営業保証金(増設)",icon:"🏗"},
{id:"hosho_hk",label:"4-4 保管替え",icon:"🔀"},{id:"hosho_kp",label:"4-5 還付",icon:"💸"},{id:"hosho_fu",label:"4-6 不足額供託",icon:"⚠️"},{id:"hosho_tr",label:"4-7 取戻し",icon:"↩️"},
{id:"hk_kanyu",label:"5-1~2 保証協会(加入)",icon:"🤝"},{id:"hk_gyomu",label:"5-3~4 保証協会(業務)",icon:"📋"},{id:"hk_kanpu",label:"5-5~6 弁済業務保証金(還付)",icon:"💸"},{id:"hk_juto",label:"5-7~9 還付充当金・地位喪失",icon:"⚠️"},{id:"hk_toku",label:"5-10~12 特別分担金等",icon:"🔧"},
{id:"baikai_shurui",label:"6-1 媒介契約(種類・有効期間)",icon:"📝"},
{id:"baikai_reins",label:"6-2 媒介契約(レインズ・報告)",icon:"📡"},
{id:"jyu35",label:"7 重要事項説明(35条)",icon:"📋"},
{id:"shomen37",label:"8 37条書面",icon:"📄"},
{id:"koukoku",label:"9 広告・取引開始時期",icon:"📣"},
{id:"hyoushiki",label:"9-2 標識",icon:"□"},{id:"hachishu",label:"9-3 8種規制",icon:"8"},
{id:"hoshu",label:"10 報酬額の制限",icon:"💴"},
{id:"kantoku",label:"11 監督処分",icon:"⚖️"},
{id:"kashi",label:"13 住宅瑕疵担保",icon:"🏚️"},
{id:"bassoku",label:"12-1 罰則",icon:"⚠️"},
{id:"touroku",label:"12-2 登録消除",icon:"🗂️"},
{id:"takenshi",label:"12-3 宅建士罰則",icon:"🪪"},
];
import { Q } from './src/questions.js';
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

const STORAGE_KEY="takken_wrong_ids";
const STATS_KEY="takken_category_stats";
async function loadWrongIds(){try{const r=await window.storage.get(STORAGE_KEY);return r?JSON.parse(r.value):[];}catch{return[];}}
async function saveWrongIds(ids){try{await window.storage.set(STORAGE_KEY,JSON.stringify([...new Set(ids)]));}catch{}}
async function addWrongId(id){const cur=await loadWrongIds();await saveWrongIds([...cur,id]);}
async function loadCategoryStats(){try{const r=await window.storage.get(STATS_KEY);return r?JSON.parse(r.value):{};}catch{return{};}}
async function saveCategoryStats(stats){try{await window.storage.set(STATS_KEY,JSON.stringify(stats));}catch{}}
async function removeWrongIds(ids){const cur=await loadWrongIds();await saveWrongIds(cur.filter(x=>!ids.includes(x)));}
function qKey(q){return `${q.cat}::${q.ref||q.q.slice(0,40)}`;}
function oldQKey(q){return q.ref||q.q.slice(0,20);}
function isWrong(q,ids){return ids.includes(qKey(q))||ids.includes(oldQKey(q));}
function updateCategoryStats(stats,cat,ok){const cur=stats[cat]||{correct:0,total:0};return {...stats,[cat]:{correct:cur.correct+(ok?1:0),total:cur.total+1}};}
function aggregateStats(stats,cats){return cats.reduce((a,id)=>{const s=stats[id];if(!s)return a;return {correct:a.correct+s.correct,total:a.total+s.total};},{correct:0,total:0});}
function rateText(s){return s&&s.total>0?`${Math.round((s.correct/s.total)*100)}%`:"未回答";}

function Prog({c,t,color}){const p=t>0?(c/t)*100:0;return(<div style={{width:"100%",height:6,background:"var(--track)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:color||"var(--accent)",borderRadius:3,transition:"width .4s ease"}}/></div>);}

export default function App(){
const[mode,setMode]=useState("menu");
const[cat,setCat]=useState("all");
const[cards,setCards]=useState([]);
const[idx,setIdx]=useState(0);
const[ans,setAns]=useState(false);
const[sel,setSel]=useState(null);
const[score,setScore]=useState(0);
const[hist,setHist]=useState([]);
const[qc,setQc]=useState(10);
const[showExp,setShowExp]=useState(false);
const[ei,setEi]=useState(null);
const[wrongIds,setWrongIds]=useState([]);
const[categoryStats,setCategoryStats]=useState({});
const[reviewMode,setReviewMode]=useState(false);

// 起動時にストレージから保存データを読み込む
useEffect(()=>{loadWrongIds().then(ids=>setWrongIds(ids));loadCategoryStats().then(stats=>setCategoryStats(stats));},[]);

const fl=cat==="all"?Q:Q.filter(c=>c.cat===cat);
const allCatIds=CATS.filter(c=>c.id!=="all").map(c=>c.id);
const allRate=rateText(aggregateStats(categoryStats,allCatIds));

const start=(isReview=false)=>{
  let pool;
  if(isReview){
    pool=Q.filter(q=>isWrong(q,wrongIds));
    if(pool.length===0)return;
  }else{
    const n=Math.min(qc,fl.length);
    pool=shuffle(fl).slice(0,n);
  }
  setReviewMode(isReview);
  setCards(pool);setIdx(0);setScore(0);setSel(null);setAns(false);setHist([]);setShowExp(false);setEi(null);setMode("quiz");
};

const answer=useCallback(async(v)=>{
  if(ans)return;
  setSel(v);setAns(true);
  const c=cards[idx];
  const key=qKey(c);
  const legacyKey=oldQKey(c);
  const ok=v===c.a;
  const nextStats=updateCategoryStats(categoryStats,c.cat,ok);
  setCategoryStats(nextStats);
  await saveCategoryStats(nextStats);
  if(ok){
    setScore(s=>s+1);
    // 正解したら間違いリストから削除
    const newIds=wrongIds.filter(x=>x!==key&&x!==legacyKey);
    setWrongIds(newIds);
    await removeWrongIds([key,legacyKey]);
  }else{
    // 不正解なら間違いリストに追加
    const newIds=[...new Set([...wrongIds,key])];
    setWrongIds(newIds);
    await addWrongId(key);
  }
  setHist(h=>[...h,{q:c.q,ok,ya:v,ra:c.a,exp:c.exp,ref:c.ref}]);
},[ans,cards,idx,wrongIds,categoryStats]);

const next=()=>{
  if(idx+1<cards.length){setIdx(idx+1);setSel(null);setAns(false);setShowExp(false);}
  else setMode("result");
};

const clearWrong=async()=>{
  setWrongIds([]);
  await saveWrongIds([]);
};

const r={"--bg":"#0f1117","--card":"#1a1d27","--card2":"#232733","--text":"#e8e6e3","--text2":"#9a97a0","--accent":"#6c63ff","--accent2":"#ff6b6b","--green":"#2ecc71","--red":"#e74c3c","--track":"#2a2d3a","--border":"#2e3140",fontFamily:"'Noto Sans JP','Hiragino Sans','Meiryo',sans-serif",background:"var(--bg)",color:"var(--text)",minHeight:"100vh",padding:0,margin:0,boxSizing:"border-box"};

// ===== MENU =====
if(mode==="menu"){
const GROUPS=[
{label:"Ch1 宅建業の定義",cats:["tochi","tatemono","torihiki","gyou","jimusho"]},
{label:"Ch2 免許",cats:["menkyo","kekka_ko","kekka_ho","menkyokae","minashi","tokurei","mumenkyo","todokede","haigyou"]},
{label:"Ch3 宅建士",cats:["tk_def","tk_kekka","tk_touroku","tk_todoke","tk_sho","tk_sennin"]},
{label:"Ch4 営業保証金",cats:["hosho_k","hosho_t","hosho_z","hosho_hk","hosho_kp","hosho_fu","hosho_tr"]},
{label:"Ch5 保証協会",cats:["hk_kanyu","hk_gyomu","hk_kanpu","hk_juto","hk_toku"]},
{label:"Ch6 媒介契約",cats:["baikai_shurui","baikai_reins"]},
{label:"Ch7 重要事項説明",cats:["jyu35"]},
{label:"Ch8 37条書面",cats:["shomen37"]},
{label:"Ch9 広告・取引開始時期",cats:["koukoku","hyoushiki","hachishu"]},
{label:"Ch10 報酬額の制限",cats:["hoshu"]},
{label:"Ch11 監督処分",cats:["kantoku"]},
{label:"Ch12 監督処分・罰則",cats:["bassoku","touroku","takenshi"]},
{label:"Ch13 住宅瑕疵担保",cats:["kashi"]},
];
return(<div style={r}><div style={{maxWidth:480,margin:"0 auto",padding:"16px 14px"}}>
{/* ヘッダー */}
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
  <span style={{fontSize:22}}>📖</span>
  <div><div style={{fontSize:16,fontWeight:800}}>宅建業法 一問一答</div><div style={{fontSize:11,color:"var(--accent)",fontWeight:700}}>{Q.length}問収録</div></div>
</div>

{/* 苦手問題モード */}
<button onClick={()=>start(true)} disabled={wrongIds.length===0} style={{width:"100%",padding:"11px 14px",borderRadius:12,border:wrongIds.length>0?"2px solid #e74c3c":"1px solid var(--border)",background:wrongIds.length>0?"rgba(231,76,60,.1)":"var(--card)",color:wrongIds.length>0?"#e74c3c":"var(--text2)",fontSize:14,fontWeight:700,cursor:wrongIds.length>0?"pointer":"not-allowed",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:wrongIds.length>0?1:.65}}>
  <span>🔴 苦手問題だけ出題</span>
  <span style={{background:wrongIds.length>0?"#e74c3c":"var(--border)",color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:12}}>{wrongIds.length}問</span>
</button>


{/* 出題数 ＋ スタート */}
<div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
  <div style={{fontSize:11,color:"var(--text2)",fontWeight:600,marginBottom:8}}>出題数</div>
  <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
    {[5,10,15,20,30,50].map(n=>{const maxN=cat==="all"?Q.length:Q.filter(x=>x.cat===cat).length;return(<button key={n} onClick={()=>setQc(n)} style={{padding:"5px 10px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",border:qc===n?"2px solid var(--accent2)":"1px solid var(--border)",background:qc===n?"rgba(255,107,107,.18)":"#12141e",color:qc===n?"var(--accent2)":"var(--text2)",opacity:n>maxN?.4:1}}>{n}</button>);})}
  </div>
  <button onClick={()=>start(false)} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:"linear-gradient(135deg,#6c63ff,#8b7cff)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(108,99,255,.35)"}}>
    スタート → ({Math.min(qc, cat==="all"?Q.length:Q.filter(x=>x.cat===cat).length)}問)
  </button>
</div>

{/* 全問ボタン */}
<button onClick={()=>setCat("all")} style={{width:"100%",padding:"9px 12px",borderRadius:10,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",border:cat==="all"?"2px solid var(--accent)":"1px solid var(--border)",background:cat==="all"?"rgba(108,99,255,.14)":"var(--card)",color:cat==="all"?"var(--accent)":"var(--text)",fontSize:13,fontWeight:700,cursor:"pointer"}}>
  <span>📚 全セクション</span><span style={{fontSize:11,color:"var(--text2)"}}>{Q.length}問 / {allRate}</span>
</button>

{/* チャプター別 */}
{GROUPS.map(g=>{
  const gCats=g.cats.filter(id=>Q.some(q=>q.cat===id));
  if(gCats.length===0)return null;
  const gTotal=Q.filter(q=>gCats.includes(q.cat)).length;
  const gRate=rateText(aggregateStats(categoryStats,gCats));
  return(
    <div key={g.label} style={{marginBottom:8}}>
      <div style={{fontSize:10,fontWeight:700,color:"var(--text2)",marginBottom:4,paddingLeft:2}}>{g.label} <span style={{color:"var(--border)"}}>({gTotal}問)</span> <span style={{color:gRate==="未回答"?"var(--text2)":"var(--green)",marginLeft:4}}>{gRate}</span></div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {gCats.map(id=>{
          const ci=CATS.find(c=>c.id===id);
          const n=Q.filter(q=>q.cat===id).length;
          const sel=cat===id;
          const wCount=Q.filter(q=>q.cat===id&&isWrong(q,wrongIds)).length;
          const cRate=rateText(categoryStats[id]);
          return(<button key={id} onClick={()=>setCat(id)} style={{padding:"5px 8px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",border:sel?"2px solid var(--accent)":"1px solid var(--border)",background:sel?"rgba(108,99,255,.14)":"var(--card)",color:sel?"var(--accent)":"var(--text2)",display:"flex",alignItems:"center",gap:4,position:"relative"}}>
            <span>{ci?.icon}</span>
            <span style={{maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ci?.label.replace(/\d+-\d+\s/,"")}</span>
            <span style={{fontSize:9,color:sel?"var(--accent)":"var(--border)",marginLeft:2}}>{n}</span>
            {cRate!=="未回答"&&<span style={{fontSize:9,color:"var(--green)",marginLeft:2}}>{cRate}</span>}
            {wCount>0&&<span style={{fontSize:9,background:"#e74c3c",color:"#fff",borderRadius:20,padding:"0 4px",marginLeft:2}}>{wCount}</span>}
          </button>);
        })}
      </div>
    </div>
  );
})}

{wrongIds.length>0&&<button onClick={clearWrong} style={{marginTop:12,width:"100%",padding:8,borderRadius:8,border:"1px solid var(--border)",background:"none",color:"var(--text2)",fontSize:11,cursor:"pointer"}}>🗑 間違いリストをリセット ({wrongIds.length}件)</button>}
</div></div>);}

// ===== QUIZ =====
if(mode==="quiz"){const c=cards[idx];const ci=CATS.find(x=>x.id===c.cat);const ok=sel===c.a;
return(<div style={r}><div style={{maxWidth:480,margin:"0 auto",padding:"24px 16px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
  <button onClick={()=>setMode("menu")} style={{background:"none",border:"none",color:"var(--text2)",fontSize:14,cursor:"pointer"}}>← 戻る</button>
  <div style={{display:"flex",gap:8,alignItems:"center"}}>
    {reviewMode&&<span style={{fontSize:10,background:"rgba(231,76,60,.2)",color:"#e74c3c",borderRadius:6,padding:"2px 6px",fontWeight:700}}>苦手問題</span>}
    <span style={{fontSize:13,color:"var(--green)",fontWeight:700}}>✓{score}</span>
    <span style={{fontSize:13,color:"var(--text2)",fontWeight:600}}>{idx+1}/{cards.length}</span>
  </div>
</div>
<Prog c={idx+1} t={cards.length} color={reviewMode?"var(--red)":"var(--accent)"}/>
<div style={{marginTop:16,padding:16,borderRadius:14,background:"var(--card)",border:"1px solid var(--border)"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:10,color:"var(--accent)",fontWeight:700}}>{ci?.icon} {ci?.label}</span>{c.ref&&<span style={{fontSize:9,color:"var(--text2)"}}>{c.ref}</span>}</div><div style={{fontSize:14,fontWeight:500,lineHeight:1.9}}>{c.q}</div></div>
{!ans?(<div style={{display:"flex",gap:12,marginTop:16}}><button onClick={()=>answer(true)} style={{flex:1,padding:"18px 0",borderRadius:14,border:"2px solid var(--green)",background:"rgba(46,204,113,.08)",color:"var(--green)",fontSize:28,fontWeight:800,cursor:"pointer"}}>○</button><button onClick={()=>answer(false)} style={{flex:1,padding:"18px 0",borderRadius:14,border:"2px solid var(--red)",background:"rgba(231,76,60,.08)",color:"var(--red)",fontSize:28,fontWeight:800,cursor:"pointer"}}>×</button></div>):(<div style={{marginTop:14}}>
<div style={{padding:14,borderRadius:14,background:ok?"rgba(46,204,113,.1)":"rgba(231,76,60,.1)",border:`2px solid ${ok?"var(--green)":"var(--red)"}`,textAlign:"center",marginBottom:10}}>
  <div style={{fontSize:18,fontWeight:800,color:ok?"var(--green)":"var(--red)",marginBottom:2}}>{ok?"正解！🎉":"不正解…"}</div>
  <div style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>正解は「{c.a?"○":"×"}」</div>
  {ok&&reviewMode&&<div style={{fontSize:11,color:"var(--green)",marginTop:4}}>✓ 間違いリストから削除されました</div>}
  {!ok&&<div style={{fontSize:11,color:"var(--red)",marginTop:4}}>🔴 間違いリストに追加されました</div>}
</div>
<button onClick={()=>setShowExp(!showExp)} style={{width:"100%",padding:9,borderRadius:9,border:"1px solid var(--border)",background:"var(--card2)",color:"var(--text2)",fontSize:12,cursor:"pointer",textAlign:"left",marginBottom:8}}>{showExp?"▼ 解説を閉じる":"▶ 解説を見る"}</button>
{showExp&&<div style={{padding:12,borderRadius:9,fontSize:12,lineHeight:1.8,background:"rgba(108,99,255,.06)",border:"1px solid rgba(108,99,255,.15)",color:"var(--text)",marginBottom:10}}>{c.exp}</div>}
<button onClick={next} style={{width:"100%",padding:13,borderRadius:12,border:"none",background:reviewMode?"var(--red)":"var(--accent)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"}}>{idx+1<cards.length?"次の問題 →":"結果を見る →"}</button>
</div>)}</div></div>);}

// ===== RESULT =====
if(mode==="result"){const t=hist.length;const cr=score;const p=Math.round((cr/t)*100);const em=p>=80?"🎉":p>=60?"👍":p>=40?"💪":"📖";const ms=p>=80?"素晴らしい！":p>=60?"いい調子！":p>=40?"もう少し！":"復習しよう！";
return(<div style={r}><div style={{maxWidth:480,margin:"0 auto",padding:"28px 16px"}}>
<div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:44,marginBottom:6}}>{em}</div><h2 style={{fontSize:19,fontWeight:800,margin:"0 0 4px"}}>{ms}</h2>{reviewMode&&<div style={{fontSize:12,color:"var(--red)",fontWeight:700}}>苦手問題だけ出題</div>}</div>
<div style={{padding:20,borderRadius:14,background:"var(--card)",border:"1px solid var(--border)",textAlign:"center",marginBottom:14}}>
  <div style={{fontSize:42,fontWeight:800,color:p>=60?"var(--green)":"var(--accent2)"}}>{p}%</div>
  <div style={{fontSize:13,color:"var(--text2)",marginTop:4}}>{cr}/{t} 正解</div>
  <div style={{marginTop:8}}><Prog c={cr} t={t}/></div>
  {wrongIds.length>0&&<div style={{marginTop:10,fontSize:12,color:"var(--red)"}}>🔴 まだ間違いリストに {wrongIds.length}問 残っています</div>}
</div>
<div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:"var(--text2)",marginBottom:6}}>解答一覧（タップで解説）</div><div style={{display:"flex",flexDirection:"column",gap:5}}>{hist.map((h,i)=>(<div key={i}><div onClick={()=>setEi(ei===i?null:i)} style={{padding:"8px 10px",borderRadius:8,fontSize:11,lineHeight:1.6,cursor:"pointer",background:h.ok?"rgba(46,204,113,.08)":"rgba(231,76,60,.08)",border:`1px solid ${h.ok?"rgba(46,204,113,.2)":"rgba(231,76,60,.2)"}`}}><div style={{fontWeight:600}}>{h.ok?"✅":"❌"} {h.q.length>45?h.q.slice(0,45)+"...":h.q}</div><div style={{fontSize:10,color:"var(--text2)"}}>あなた:{h.ya?"○":"×"} / 正解:{h.ra?"○":"×"}</div></div>{ei===i&&<div style={{padding:"7px 10px",margin:"2px 0",borderRadius:6,fontSize:11,lineHeight:1.7,background:"rgba(108,99,255,.06)",border:"1px solid rgba(108,99,255,.12)"}}>{h.exp}</div>}</div>))}</div></div>
<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
  <button onClick={()=>setMode("menu")} style={{flex:1,padding:12,borderRadius:11,border:"1px solid var(--border)",background:"var(--card)",color:"var(--text)",fontSize:13,fontWeight:600,cursor:"pointer"}}>メニューへ</button>
  {wrongIds.length>0&&<button onClick={()=>start(true)} style={{flex:1,padding:12,borderRadius:11,border:"2px solid var(--red)",background:"rgba(231,76,60,.1)",color:"var(--red)",fontSize:13,fontWeight:700,cursor:"pointer"}}>🔴 苦手問題 ({wrongIds.length}問)</button>}
  <button onClick={()=>start(reviewMode)} style={{flex:1,padding:12,borderRadius:11,border:"none",background:reviewMode?"var(--red)":"var(--accent)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"}}>もう一度</button>
</div>
</div></div>);}
return null;}





