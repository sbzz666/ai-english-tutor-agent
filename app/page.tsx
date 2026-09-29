"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Flame, Headphones, Home, MessageCircle, Mic, RotateCcw, Search, Send, Star, Volume2, X } from "lucide-react";
import { CURRICULUM, lessonsForGrade } from "@/lib/curriculum";

type ReviewRecord = { step:number; due:string };
type Cursor = { lessonId:string; wordIndex:number };
type Progress = { xp:number; streak:number; completed:string[]; mistakes:string[]; mastered:string[]; review:Record<string,ReviewRecord>; reviewed:Record<string,string[]>; cursors:Record<number,Cursor>; lastGrade:number };
type Message = { role:"assistant"|"user"; content:string };
const INITIAL:Progress={xp:0,streak:0,completed:[],mistakes:[],mastered:[],review:{},reviewed:{},cursors:{},lastGrade:3};
const WORD_BANK = Object.entries(CURRICULUM).flatMap(([grade, lessons]) => lessons.flatMap(lesson => lesson.words.map((word, index) => ({ ...word, grade:Number(grade), lessonId:lesson.id, lessonTitle:lesson.title, index }))));
const UNIQUE_WORD_COUNT = new Set(WORD_BANK.map(item => item.word.toLowerCase())).size;
const REVIEW_BATCH_SIZE = 10;
const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`}
function daysLater(days:number){const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+days);return localDate(date)}
function wordKey(item:{lessonId:string;word:string}){return `${item.lessonId}:${item.word}`}

declare global { interface Window { SpeechRecognition?:new()=>SpeechLike; webkitSpeechRecognition?:new()=>SpeechLike } interface Document { modelContext?:{ registerTool:(tool:Record<string,unknown>,options?:{signal:AbortSignal})=>void|Promise<void> } } }
type SpeechLike={lang:string;interimResults:boolean;onresult:(e:{results:ArrayLike<{0:{transcript:string}}>})=>void;onerror:()=>void;onend:()=>void;start:()=>void};

export default function HomePage(){
  const [grade,setGrade]=useState(3),[lessonId,setLessonId]=useState("g3-animals"),[wordIndex,setWordIndex]=useState(0);
  const [mode,setMode]=useState<"learn"|"quiz"|"search"|"chat"|"report">("learn"),[query,setQuery]=useState("");
  const [reviewKeys,setReviewKeys]=useState<string[]>([]),[reviewIndex,setReviewIndex]=useState(0),[reviewRevealed,setReviewRevealed]=useState(false),[reviewExtra,setReviewExtra]=useState(false);
  const [learningFinished,setLearningFinished]=useState(false);
  const [today,setToday]=useState(localDate);
  const [speechFeedback,setSpeechFeedback]=useState("");
  const [hydrated,setHydrated]=useState(false);
  const [progress,setProgress]=useState<Progress>(INITIAL),[input,setInput]=useState(""),[listening,setListening]=useState(false),[loading,setLoading]=useState(false);
  const [messages,setMessages]=useState<Message[]>([{role:"assistant",content:"Hi! I'm Mia. 今天我们一起学英语吧！What would you like to practise?"}]);
  const lessons=useMemo(()=>lessonsForGrade(grade),[grade]);
  const lesson=lessons.find(x=>x.id===lessonId)??lessons[0],word=lesson.words[wordIndex];
  const learnedWords=WORD_BANK.filter(item=>item.grade===grade&&progress.review[wordKey(item)]);
  const dueWords=learnedWords.filter(item=>progress.review[wordKey(item)].due<=today).sort((a,b)=>progress.review[wordKey(a)].due.localeCompare(progress.review[wordKey(b)].due));
  const currentReview=WORD_BANK.find(item=>wordKey(item)===reviewKeys[reviewIndex]);
  const nextLesson=lessons[lessons.findIndex(item=>item.id===lesson.id)+1];
  const searchResults=useMemo(()=>{const term=query.trim().toLocaleLowerCase();return term?WORD_BANK.filter(x=>x.word.toLocaleLowerCase().includes(term)||x.zh.includes(term)):[]},[query]);
  const gradeCompleted=progress.completed.filter(id=>lessons.some(x=>x.id===id)).length;
  const completion=Math.round(gradeCompleted/lessons.length*100);

  useEffect(()=>{try{const saved=localStorage.getItem("mia-progress");if(saved){const parsed=JSON.parse(saved) as Partial<Progress>;const review=parsed.review??Object.fromEntries((parsed.mastered??[]).map(key=>[key,{step:0,due:localDate()}]));const restored={...INITIAL,...parsed,completed:parsed.completed??[],mistakes:parsed.mistakes??[],mastered:parsed.mastered??[],review,reviewed:parsed.reviewed??{},cursors:parsed.cursors??{}};setProgress(restored);const savedGrade=parsed.lastGrade;if(savedGrade&&CURRICULUM[savedGrade]){setGrade(savedGrade);const cursor=restored.cursors[savedGrade];const savedLesson=CURRICULUM[savedGrade].find(item=>item.id===cursor?.lessonId);setLessonId(savedLesson?.id??CURRICULUM[savedGrade][0].id);setWordIndex(savedLesson?Math.min(cursor.wordIndex,savedLesson.words.length-1):0)}}}catch{}setHydrated(true)},[]);
  useEffect(()=>{if(hydrated)localStorage.setItem("mia-progress",JSON.stringify(progress));},[progress,hydrated]);
  useEffect(()=>{const timer=window.setInterval(()=>setToday(localDate()),60_000);return()=>window.clearInterval(timer)},[]);
  useEffect(()=>{setSpeechFeedback("")},[lessonId,wordIndex]);
  useEffect(()=>{const ctx=document.modelContext;if(!ctx?.registerTool)return;const c=new AbortController();void Promise.resolve(ctx.registerTool({name:"start_english_lesson",title:"开始英语课",description:"Open an elementary English lesson for the selected grade.",inputSchema:{type:"object",properties:{lessonId:{type:"string",enum:lessons.map(x=>x.id)}},required:["lessonId"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(raw:unknown)=>{const v=raw as {lessonId?:string};if(!lessons.some(x=>x.id===v.lessonId))throw Error("Unknown lesson");setLessonId(v.lessonId!);setWordIndex(0);setMode("learn");return{opened:v.lessonId}}},{signal:c.signal})).catch(()=>{});return()=>c.abort()},[lessons]);

  function speak(text:string,rate=.78,followUp?:string){
    if(!("speechSynthesis" in window))return;
    window.speechSynthesis.cancel();
    const say=(content:string)=>{const utterance=new SpeechSynthesisUtterance(content);utterance.lang="en-US";utterance.rate=rate;window.speechSynthesis.speak(utterance)};
    say(text);
    if(followUp)say(followUp);
  }
  function listen(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){if(mode==="learn")setSpeechFeedback("当前浏览器不支持语音识别。可以先听发音，再跟读练习。");else setMessages(v=>[...v,{role:"assistant",content:"请使用 Chrome 或 Edge 进行语音识别，也可以直接打字。"}]);return}const r=new R();r.lang="en-US";r.interimResults=false;r.onresult=e=>{const transcript=e.results[0][0].transcript;if(mode==="learn"){const heard=transcript.toLowerCase().replace(/[^a-z\s]/g,"").split(/\s+/);setSpeechFeedback(heard.includes(word.word.toLowerCase())?`听到了“${transcript}”，这个单词记住啦！`:`听到了“${transcript}”。再听一次 ${word.word}，慢慢试试。`)}else setInput(transcript);setListening(false)};r.onerror=()=>{setListening(false);if(mode==="learn")setSpeechFeedback("没有听清楚。靠近麦克风再试一次吧。")};r.onend=()=>setListening(false);setListening(true);setSpeechFeedback("");r.start()}
  async function send(){const content=input.trim();if(!content||loading)return;const next=[...messages,{role:"user" as const,content}];setMessages(next);setInput("");setLoading(true);try{const res=await fetch("/api/tutor",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next.slice(-8),grade,lesson:lesson.title})});const data=await res.json() as {reply?:string};setMessages(v=>[...v,{role:"assistant",content:data.reply||"Let's try again!"}])}catch{setMessages(v=>[...v,{role:"assistant",content:"网络开小差了。Say: I like English!"}])}finally{setLoading(false)}}
  function advanceWord(){
    const key=`${lesson.id}:${word.word}`;
    const lastWord=wordIndex===lesson.words.length-1;
    const upcomingWord=lastWord?nextLesson?.words[0]:lesson.words[wordIndex+1];
    const cursor=lastWord&&nextLesson?{lessonId:nextLesson.id,wordIndex:0}:{lessonId:lesson.id,wordIndex:Math.min(wordIndex+1,lesson.words.length-1)};
    setProgress(p=>{
      const firstTime=!p.review[key];
      const review=firstTime?{...p.review,[key]:{step:0,due:daysLater(1)}}:p.review;
      const completed=lastWord&&!p.completed.includes(lesson.id)?[...p.completed,lesson.id]:p.completed;
      return {...p,review,completed,cursors:{...p.cursors,[grade]:cursor},lastGrade:grade,xp:p.xp+(firstTime?1:0)};
    });
    setSpeechFeedback("");
    if(lastWord){
      if(nextLesson){setLessonId(nextLesson.id);setWordIndex(0)}
      else setLearningFinished(true);
    }else setWordIndex(i=>i+1);
    if(upcomingWord)speak(upcomingWord.word,.78,upcomingWord.example);
    else window.speechSynthesis?.cancel();
  }
  function startReview(extra=false){
    const candidates=extra?learnedWords.slice(-REVIEW_BATCH_SIZE):dueWords.slice(0,REVIEW_BATCH_SIZE);
    setReviewKeys(candidates.map(wordKey));setReviewIndex(0);setReviewRevealed(false);setReviewExtra(extra);setMode("quiz");
  }
  function finishReview(remembered:boolean){
    if(!currentReview)return;
    const key=wordKey(currentReview);
    setProgress(p=>{
      const previous=p.review[key]??{step:0,due:today};
      const step=remembered?Math.min(previous.step+1,REVIEW_INTERVALS.length-1):0;
      const review={...p.review,[key]:{step,due:remembered?daysLater(REVIEW_INTERVALS[step]):today}};
      const done=p.reviewed[today]??[];
      const reviewed=remembered&&!done.includes(key)?{...p.reviewed,[today]:[...done,key]}:p.reviewed;
      return {...p,review,reviewed,xp:p.xp+(remembered&&!done.includes(key)?2:0)};
    });
    if(!remembered)setReviewKeys(keys=>[...keys,key]);
    setReviewIndex(index=>index+1);setReviewRevealed(false);
  }
  function changeGrade(nextGrade:number){const next=lessonsForGrade(nextGrade);const cursor=progress.cursors[nextGrade];const savedLesson=next.find(item=>item.id===cursor?.lessonId);window.speechSynthesis?.cancel();setGrade(nextGrade);setLessonId(savedLesson?.id??next[0].id);setWordIndex(savedLesson?Math.min(cursor.wordIndex,savedLesson.words.length-1):0);setLearningFinished(false);setProgress(p=>({...p,lastGrade:nextGrade}));setSpeechFeedback("");setInput("");setMode("learn");setMessages([{role:"assistant",content:`Hi! I'm Mia. 我们来学习 ${nextGrade} 年级英语吧！What would you like to practise?`}]);}
  function selectLesson(targetId:string){
    const selected=lessons.find(item=>item.id===targetId);
    if(!selected)return;
    const index=selected.id===lesson.id?wordIndex:0;
    window.speechSynthesis?.cancel();
    setLessonId(selected.id);setWordIndex(index);setLearningFinished(false);setSpeechFeedback("");
    setProgress(p=>({...p,cursors:{...p.cursors,[grade]:{lessonId:selected.id,wordIndex:index}},lastGrade:grade}));
  }
  function openFoundWord(item:{grade:number;lessonId:string;index:number}){window.speechSynthesis?.cancel();setGrade(item.grade);setLessonId(item.lessonId);setWordIndex(item.index);setLearningFinished(false);setSpeechFeedback("");setMode("learn")}

  return <main className="app-shell">
    <aside className="sidebar"><button className="brand" onClick={()=>setMode("learn")}><span className="brand-mark">M</span><span>Mia English</span></button><nav>
      <Nav active={mode==="learn"} icon={<Home/>} label="继续学习" go={()=>setMode("learn")}/><Nav active={mode==="search"} icon={<Search/>} label="查单词" go={()=>setMode("search")}/><Nav active={mode==="quiz"} icon={<RotateCcw/>} label={`今日复习${dueWords.length?` ${dueWords.length}`:""}`} go={()=>startReview()}/><Nav active={mode==="chat"} icon={<MessageCircle/>} label="AI 口语老师" go={()=>setMode("chat")}/><Nav active={mode==="report"} icon={<BookOpen/>} label="学习报告" go={()=>setMode("report")}/>
    </nav><div className="sidebar-foot"><div className="avatar">🧒</div><div><strong>英语小学员</strong><small>{grade} 年级</small></div></div></aside>
    <section className="workspace"><header className="topbar"><div><span className="eyebrow">MIA ENGLISH</span><h1>{mode==="chat"?"口语练习":mode==="quiz"?"今日复习":mode==="search"?"查单词":mode==="report"?"学习记录":"继续学习"}</h1></div><div className="top-actions"><label className="grade-select">年级<select value={grade} onChange={e=>changeGrade(+e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} 年级</option>)}</select></label><span className="stat fire"><Flame/>{progress.streak}天</span><span className="stat xp"><Star/>{progress.xp} XP</span></div></header>
    <div className="word-search-bar"><Search aria-hidden="true"/><input aria-label="检索英语单词或中文意思" value={query} onChange={e=>{setQuery(e.target.value);setMode("search")}} onFocus={()=>setMode("search")} placeholder="查单词：输入英语或中文，例如 panda、熊猫"/>{query&&<button aria-label="清除搜索" onClick={()=>setQuery("")}><X/></button>}</div>
    <p className="curriculum-note">一年级起点方向 · 覆盖 1–6 年级 · 当前收录 {UNIQUE_WORD_COUNT} 个不同单词。主题拓展练习词库，尚非人教版教材逐课词表。</p>
    {mode==="learn"&&<div className="theme-switcher"><label htmlFor="lesson-select">自由切换主题</label><select id="lesson-select" value={lesson.id} onChange={e=>selectLesson(e.target.value)}>{lessons.map((item,index)=><option key={item.id} value={item.id}>{index+1}. {item.zh} · {item.words.length} 词{progress.completed.includes(item.id)?" · 已学完":""}</option>)}</select><span>学完当前主题会自动进入下一个</span></div>}
    {mode==="learn"&&speechFeedback&&<p className="speech-feedback" role="status">{speechFeedback}</p>}
    {mode==="learn"&&(learningFinished?<section className="finished-panel panel"><Check/><span className="eyebrow">{grade} 年级</span><h2>这一级的词卡学完了</h2><p>明天会按记忆间隔提醒你复习。今天也可以先巩固已学单词。</p><button className="primary" onClick={()=>startReview(dueWords.length===0)}>开始复习</button></section>:<div className="learn-grid"><section className="lesson-stage"><div className="stage-head"><div><span className="eyebrow">{grade} 年级 · 主题 {lessons.findIndex(x=>x.id===lesson.id)+1} / {lessons.length}</span><h2>{lesson.title}</h2><p>{lesson.zh} · 听单词，再听例句</p></div><span className="word-count">{wordIndex+1} / {lesson.words.length}</span></div><div className={`word-card ${lesson.color}`}><div className="animal-art">{word.emoji}</div><div className="word-copy"><button className="sound-button" aria-label="播放单词和例句" title="先读单词，再读例句" onClick={()=>speak(word.word,.78,word.example)}><Volume2/></button><h3>{word.word}</h3><strong>{word.zh}</strong><button className="example" onClick={()=>speak(word.example)}><Headphones/>{word.example}</button></div></div><div className="stage-controls"><button className="secondary" disabled={!wordIndex} onClick={()=>setWordIndex(i=>Math.max(0,i-1))}>上一个</button><button className={`mic-button ${listening?"recording":""}`} onClick={listen}><Mic/>{listening?"正在听…":"跟我读"}</button><button className="primary" onClick={advanceWord}>{wordIndex===lesson.words.length-1?(nextLesson?"学完，继续下个主题":"完成本年级"):"学会了，继续"}</button></div></section><aside className="study-panel"><span className="eyebrow">今日安排</span><h3>{dueWords.length?`${dueWords.length} 个单词待复习`:"今天已无到期复习"}</h3><p>每次复习最多 {REVIEW_BATCH_SIZE} 个词，记不牢的词会在本轮再次出现。</p><button className="review-cta" onClick={()=>startReview(dueWords.length===0)}>{dueWords.length?"开始今日复习":learnedWords.length?"额外巩固已学词":"先学几个单词"}</button><div className="study-divider"/><span className="eyebrow">当前进度</span><strong className="study-number">{learnedWords.length} <small>/ {lessons.reduce((sum,item)=>sum+item.words.length,0)} 词</small></strong><div className="progress-track"><i style={{width:`${completion}%`}}/></div><p>已完成 {gradeCompleted} / {lessons.length} 个主题</p><div className="next-topic"><span>当前</span><strong>{lesson.zh}</strong><span>接下来</span><strong>{nextLesson?.zh??"完成本年级"}</strong></div></aside></div>)}
    {mode==="search"&&<section className="search-panel panel"><div className="search-intro"><span className="eyebrow">1–6 年级课程词库</span><h2>查一查，听一听，记一记</h2><p>输入单词或中文意思，找到后可听发音、看例句，也可以回到所在课程。</p></div>{!query.trim()?<p className="search-empty">试试搜索“panda”“熊猫”或“苹果”。</p>:searchResults.length?<div className="search-results">{searchResults.map(item=><article className="search-result" key={`${item.lessonId}:${item.word}`}><span className="search-emoji" aria-hidden="true">{item.emoji}</span><div className="search-details"><strong>{item.word}</strong><span>{item.zh} · {item.grade} 年级 · {item.lessonTitle}</span><p>{item.example}</p></div><div className="search-actions"><button onClick={()=>speak(item.word)} aria-label={`朗读 ${item.word}`}><Volume2/>听发音</button><button onClick={()=>openFoundWord(item)}>去学习</button></div></article>)}</div>:<p className="search-empty">课程词库里还没有这个词。可以换个拼写，或试试中文意思。</p>}</section>}
    {mode==="quiz"&&<section className="review-panel panel"><div className="review-head"><span className="eyebrow">{reviewExtra?"额外巩固":"今日复习"} · {Math.min(reviewIndex+1,reviewKeys.length)} / {reviewKeys.length}</span><span>今日已巩固 {progress.reviewed[today]?.length??0} 词</span></div>{currentReview?<><p className="review-prompt">先想一想，再揭晓答案</p><h2>{currentReview.zh}</h2>{reviewRevealed?<div className="review-answer"><button aria-label="播放单词和例句" onClick={()=>speak(currentReview.word,.78,currentReview.example)}><Volume2/></button><strong>{currentReview.word}</strong><p>{currentReview.example}</p><button className="review-sentence" onClick={()=>speak(currentReview.example)}>单独听例句</button></div>:<button className="reveal-button" onClick={()=>setReviewRevealed(true)}>显示单词</button>}{reviewRevealed&&<div className="review-decisions"><button onClick={()=>finishReview(false)}>还没记牢 · 稍后再看</button><button onClick={()=>finishReview(true)}>记住了 · 下一个</button></div>}</>:<div className="review-complete"><Check/><h2>{reviewKeys.length?"这一组复习完成":"今天没有到期单词"}</h2><p>{reviewKeys.length?`今天还剩 ${dueWords.length} 个到期词。`:learnedWords.length?"已学单词会按间隔自动安排复习，明天再来看看。":"先学习单词，之后这里会自动安排复习。"}</p><div><button onClick={()=>setMode("learn")}>继续学习</button>{dueWords.length>0?<button onClick={()=>startReview()}>继续复习</button>:learnedWords.length>0?<button onClick={()=>startReview(true)}>额外巩固</button>:null}</div></div>}</section>}
    {mode==="chat"&&<section className="chat-layout"><div className="teacher-card"><div className="teacher-face">M</div><div><span className="online-dot"/>AI 英语老师</div><h2>Hi, I&apos;m Mia!</h2><p>和我练单词、句型和简单对话。</p><button onClick={()=>setInput(`Let's talk about ${lesson.title}.`)}>Let&apos;s talk about {lesson.title}.</button><button onClick={()=>setInput("Can you quiz me?")}>Can you quiz me?</button><small>不会收集你的真实姓名、学校或地址。</small></div><div className="chat-panel panel"><div className="messages">{messages.map((m,i)=><div key={i} className={`message ${m.role}`}>{m.role==="assistant"&&<span className="mini-mia">M</span>}<p>{m.content}</p>{m.role==="assistant"&&<button onClick={()=>speak(m.content)}><Volume2/></button>}</div>)}{loading&&<div className="message assistant"><span className="mini-mia">M</span><p>Mia is thinking…</p></div>}</div><div className="composer"><button className={listening?"recording":""} onClick={listen}><Mic/></button><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="输入英文，或点击麦克风说话…" maxLength={300}/><button className="send" onClick={send}><Send/></button></div></div></section>}
    {mode==="report"&&<section className="report-grid"><div className="report-hero panel"><span className="eyebrow">{grade} 年级 · LEARNING REPORT</span><h2>我的学习记录</h2><p>继续保持短时、高频、大声读的好习惯。</p><div className="report-score"><strong>{progress.xp}</strong><span>累计 XP</span></div></div><div className="metric panel"><RotateCcw/><strong>{dueWords.length}</strong><span>今日待复习</span></div><div className="metric panel"><Check/><strong>{gradeCompleted}</strong><span>本年级完成主题</span></div><div className="review panel"><h3><RotateCcw/>今天的复习</h3>{dueWords.length?dueWords.slice(0,12).map(item=><button key={wordKey(item)} onClick={()=>speak(item.word)}>{item.word}<Volume2/></button>):<p>今天没有到期单词。已学单词会按间隔自动安排复习。</p>}<p>今日已巩固 {progress.reviewed[today]?.length??0} 个词。</p></div><div className="parent-note panel"><h3>给家长的建议</h3><p>每天陪孩子练习 5–10 分钟。先回想、再揭晓答案；忘记的词本轮再看一次，不必追求一次全对。</p></div></section>}
    </section>
  </main>
}
function Nav({active,icon,label,go}:{active:boolean;icon:React.ReactNode;label:string;go:()=>void}){return <button className={active?"active":""} onClick={go}>{icon}<span>{label}</span></button>}
