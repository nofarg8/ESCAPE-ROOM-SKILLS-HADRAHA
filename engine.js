/* מנוע חדר בריחה - נופר גרגרוד | פיתוח חשיבה | תשפ"ז
   הדף של החדר מגדיר GAME ו-ROOMS, ואחר כך טוען את הקובץ הזה. */
(function(){ GAME.extendMinutes = (GAME.extendMinutes==null?10:GAME.extendMinutes); GAME.tool = GAME.tool||{label:"",html:""}; GAME.intro = Object.assign({video:"",videoLink:"",image:"",rules:[]}, GAME.intro||{}); ROOMS.forEach(r=>{ r.hints=r.hints||[]; r.summary=r.summary||{title:"מה גילינו",text:""}; }); })();
(function(){ if(!document.getElementById('stage')) document.body.insertAdjacentHTML('afterbegin', '<div id="bg-img" aria-hidden="true"></div> <div id="ambient" aria-hidden="true"></div> <header> <h1 id="game-title"></h1> <div class="hud"> <div class="steps" id="steps" aria-hidden="true"></div> <span class="timer" id="timer" hidden></span> <button class="icon-btn" id="tool-btn" hidden></button> <button class="icon-btn" id="sound-btn" aria-pressed="true">צליל: פועל</button> </div> </header> <main id="stage" aria-live="polite"></main> <div class="overlay trans" id="ov-trans"><div><h3 id="trans-text"></h3><div class="bar"><span></span></div></div></div> <div class="overlay" id="ov-modal" role="dialog" aria-modal="true"><div class="panel" id="modal-body"></div></div> <div id="confetti" aria-hidden="true"></div>'); })();

/* ===== 3. תוכן: כל הטקסטים כתובים מראש. אין קריאות ל-API ואין מודל שפה. ===== */
/* ===== 4. מנוע: לא לשנות. מותר להוסיף. ===== */
const $=s=>document.querySelector(s);
let room=-1, secs=GAME.minutes*60, timerId=null, extended=false, sound=true, hintStep=0;
const sfx = type => { if(!sound) return; try{ const c=new (window.AudioContext||window.webkitAudioContext)(), t=c.currentTime;
  const tone=(f,d,w,v,at)=>{const o=c.createOscillator(),g=c.createGain();o.type=w;o.frequency.setValueAtTime(f,t+at);g.gain.setValueAtTime(v,t+at);
    g.gain.linearRampToValueAtTime(0,t+at+d);o.connect(g);g.connect(c.destination);o.start(t+at);o.stop(t+at+d);};
  if(type==="click") tone(600,.08,"triangle",.05,0);
  if(type==="ok"){ tone(440,.18,"sine",.1,0); tone(660,.25,"sine",.1,.12); }
  if(type==="bad") tone(140,.3,"sawtooth",.07,0);
  if(type==="win") [523,659,784,1047].forEach((f,i)=>tone(f,.45,"sine",.12,i*.15));
}catch(e){} };
function briefBox(text){ return `<div class="brief"><span class="tag">${GAME.sender}</span>${text}</div>`; }
function setBg(url){ const b=$("#bg-img"); if(!url){ b.classList.remove("on"); return; } const im=new Image();
  im.onload=()=>{ b.style.backgroundImage=`url("${url}")`; b.classList.add("on"); }; im.onerror=()=>b.classList.remove("on"); im.src=url; }
function steps(){ $("#steps").innerHTML=ROOMS.map((r,i)=>`<i class="${i<room||room>=ROOMS.length?"done":""}"></i>`).join(""); }
function showModal(html){ $("#modal-body").innerHTML=html; $("#ov-modal").classList.add("on"); const b=$("#modal-body .btn"); if(b) b.focus(); }
function closeModal(){ $("#ov-modal").classList.remove("on"); }
function transition(text, then){ $("#trans-text").textContent=text; const o=$("#ov-trans"); o.classList.remove("on"); void o.offsetWidth; o.classList.add("on");
  setTimeout(()=>{ o.classList.remove("on"); then(); }, 1900); }
function typeText(el, text, done){ let i=0; el.textContent=""; const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce){ el.textContent=text; done&&done(); return; }
  const id=setInterval(()=>{ if(!el.isConnected||el.dataset.full){ clearInterval(id); return; } el.textContent+=text.charAt(i++); if(i>=text.length){ clearInterval(id); done&&done(); } },18); }
function fmt(s){ s=Math.max(s,0); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
function tick(){ secs--; const t=$("#timer"); t.textContent=fmt(secs); t.classList.toggle("low",secs<=300);
  if(secs===300 && !extended && GAME.extendMinutes){ clearInterval(timerId);
    showModal(`<h2>נשארו 5 דקות!</h2><p>${GAME.sender}: אפשר לקבל עוד <span class="num">${GAME.extendMinutes}</span> דקות.</p>
      <div class="row" style="justify-content:center"><button class="btn warm" id="ext">כן, הוסיפו זמן</button><button class="btn" id="noext">נמשיך בלי</button></div>`);
    $("#ext").onclick=()=>{ extended=true; secs+=GAME.extendMinutes*60; closeModal(); startTimer(); };
    $("#noext").onclick=()=>{ extended=true; closeModal(); startTimer(); }; }
  if(secs<=0){ clearInterval(timerId); timeUp(); } }
function startTimer(){ clearInterval(timerId); const t=$("#timer"); t.hidden=false; t.textContent=fmt(secs); timerId=setInterval(tick,1000); }
function intro(){ room=-1; steps(); setBg(GAME.intro.image); $("#game-title").textContent=GAME.title; document.title=GAME.title;
  $("#stage").innerHTML=`<section class="view panel"><h2>${GAME.title}</h2>${GAME.intro.video?`<div class="video"><iframe src="${GAME.intro.video}" title="סרטון פתיחה" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe></div><p><a href="${GAME.intro.videoLink||GAME.intro.video}" target="_blank" rel="noopener" style="color:var(--muted)">הסרטון לא נפתח? לצפייה ביוטיוב</a></p>`:""}
    ${briefBox(`<p class="typed" id="typed"></p>`)}<h3>כללים</h3><ul>${GAME.intro.rules.map(r=>`<li>${r}</li>`).join("")}</ul>
    <p>קהל יעד: ${GAME.audience} | זמן: <span class="num">${GAME.minutes}</span> דקות</p>
    <div class="row"><button class="btn big warm" id="go" hidden>יוצאים לדרך</button></div></section>`;
  typeText($("#typed"), GAME.intro.story, ()=>{ const g=$("#go"); if(g){ g.hidden=false; g.focus({preventScroll:true}); } });
  $("#typed").onclick=()=>{ const t=$("#typed"); t.dataset.full="1"; t.textContent=GAME.intro.story; $("#go").hidden=false; };
  $("#go").onclick=()=>{ sfx("click"); startTimer(); nextRoom(); }; }
function nextRoom(){ room++; steps(); hintStep=0;
  if(room>=ROOMS.length){ victory(); return; }
  const r=ROOMS[room]; transition(r.transition||"ממשיכים...", ()=>renderRoom(r)); }
function renderRoom(r){ setBg(r.image||"");
  $("#stage").innerHTML=`<section class="view panel" id="room-card"><h2 tabindex="-1">${r.title}</h2>${briefBox(`<p>${r.brief}</p>`)}
    <div id="puzzle"></div><div class="status" id="status" role="status">ממתינים לפעולה שלכם...</div>
    <div class="row"><button class="icon-btn" id="hint-btn">רמז</button></div><div id="hints"></div></section>`;
  $("#room-card h2").focus({preventScroll:true}); window.scrollTo(0,0);
  $("#hint-btn").onclick=()=>{ if(hintStep<r.hints.length){ $("#hints").insertAdjacentHTML("beforeend",`<div class="hint"><strong>רמז <span class="num">${hintStep+1}</span>:</strong> ${r.hints[hintStep]}</div>`); hintStep++; } };
  r.mount($("#puzzle"), API); }
const API = {
  status(msg){ const s=$("#status"); s.className="status"; s.textContent=msg; },
  fail(msg){ const s=$("#status"); s.className="status bad"; s.textContent=msg; sfx("bad"); const c=$("#room-card"); c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); },
  click(){ sfx("click"); },
  solve(msg){ const s=$("#status"); s.className="status ok"; s.textContent=msg||"נכון!"; sfx("ok"); $("#room-card").classList.add("solved");
    const r=ROOMS[room]; setTimeout(()=>showModal(`<h2>${r.summary.title}</h2><p>${r.summary.text}</p><div class="row" style="justify-content:center"><button class="btn big" id="cont">הבנו, ממשיכים</button></div>`),1400);
    setTimeout(()=>{ const b=$("#cont"); if(b) b.onclick=()=>{ closeModal(); nextRoom(); }; },1450); }
};
/* ===== 5. רכיבי פעולה מוכנים: לא לשנות. משתמשים בהם בתוך mount ===== */
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const mk=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const onKey=(e,f)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f();}};
const checkBtn=(label,f)=>{const r=mk("div","row"),b=mk("button","btn",label||"בדיקה");b.onclick=f;r.appendChild(b);return r;};
/* מיון / הנחה במודל: items:[{label, zone, why}], zones:[{id,label}], onDone */
API.sorter=(el,o)=>{let sel=null;const w=mk("div","w-sort"),tray=mk("div","w-tray"),zw=mk("div","w-zones"),n=o.items.length;
  w.appendChild(mk("p","w-hint",o.help||"בוחרים פריט ולוחצים על האזור שלו (או גוררים). בסוף לוחצים בדיקה."));
  const cards=shuffle(o.items).map(it=>{const c=mk("div","w-card",it.label);c.tabIndex=0;c.draggable=true;c.setAttribute("role","button");c.it=it;
    const pick=()=>{API.click();if(sel)sel.classList.remove("sel");sel=(sel===c)?null:c;if(sel)c.classList.add("sel");};
    c.onclick=e=>{e.stopPropagation();pick();};c.onkeydown=e=>onKey(e,pick);c.ondragstart=()=>{sel=c;c.classList.add("sel");};tray.appendChild(c);return c;});
  const count=()=>{const k=cards.filter(c=>c.parentNode!==tray).length;API.status(`${o.label||"הונחו"} ${k} מתוך ${n}`);};
  const place=dest=>{if(!sel)return;sel.classList.remove("sel","bad","good");dest.appendChild(sel);sel=null;API.click();count();};
  const target=(box,drop)=>{box.onclick=()=>place(drop);box.onkeydown=e=>{if(e.target===box)onKey(e,()=>place(drop));};
    box.ondragover=e=>{e.preventDefault();box.classList.add("over");};box.ondragleave=()=>box.classList.remove("over");
    box.ondrop=e=>{e.preventDefault();box.classList.remove("over");place(drop);};};
  target(tray,tray);
  o.zones.forEach(z=>{const box=mk("div","w-zone",`<b>${z.label}</b>`),drop=mk("div","w-drop");box.tabIndex=0;box.setAttribute("role","button");box.dataset.zone=z.id;box.appendChild(drop);target(box,drop);zw.appendChild(box);});
  w.append(tray,zw,checkBtn(o.check,()=>{if(cards.some(c=>c.parentNode===tray)){API.fail(o.leftMsg||"עוד נשארו פריטים במגש.");return;}
    const bad=cards.filter(c=>c.parentNode.parentNode.dataset.zone!==c.it.zone);cards.forEach(c=>c.classList.toggle("good",!bad.includes(c)));
    if(!bad.length){(o.onDone||(()=>API.solve()))();return;}
    bad.forEach(c=>c.classList.add("bad"));API.fail((bad[0].it.why||"יש פריט במקום לא נכון.")+(bad.length>1?` (עוד ${bad.length-1} במקום לא נכון)`:""));
    setTimeout(()=>{bad.forEach(c=>{c.classList.remove("bad");tray.appendChild(c);});count();},1600);}));
  el.appendChild(w);count();return w;};
/* סידור ברצף: items:[טקסטים בסדר הנכון], onDone */
API.sequence=(el,o)=>{const ul=mk("ol","w-seq");let drag=null;el.appendChild(mk("p","w-hint",o.help||"מסדרים בחיצים (או גוררים), ולוחצים בדיקה."));
  const renum=()=>[...ul.children].forEach((li,i)=>li.querySelector(".n").textContent=i+1);
  let order=shuffle(o.items);if(order.join("|")===o.items.join("|"))order.reverse();
  order.forEach(t=>{const li=mk("li","",`<span class="n num"></span><span class="t">${t}</span>`);li.t=t;li.draggable=true;
    const up=mk("button","w-mini","▲"),dn=mk("button","w-mini","▼");up.setAttribute("aria-label","למעלה");dn.setAttribute("aria-label","למטה");
    up.onclick=()=>{if(li.previousElementSibling)ul.insertBefore(li,li.previousElementSibling);API.click();renum();up.focus();};
    dn.onclick=()=>{if(li.nextElementSibling)ul.insertBefore(li.nextElementSibling,li);API.click();renum();dn.focus();};
    li.ondragstart=()=>drag=li;li.ondragover=e=>{e.preventDefault();if(drag&&drag!==li){const r=li.getBoundingClientRect();ul.insertBefore(drag,e.clientY<r.top+r.height/2?li:li.nextSibling);renum();}};
    li.append(up,dn);ul.appendChild(li);});
  renum();el.append(ul,checkBtn(o.check,()=>{const lis=[...ul.children];let k=0;lis.forEach((li,i)=>{const ok=li.t===o.items[i];li.classList.toggle("good",ok);if(ok)k++;});
    if(k===lis.length)(o.onDone||(()=>API.solve()))();else API.fail(`${k} מתוך ${lis.length} במקום הנכון. ${o.why||""}`);}));return ul;};
/* מנעול גלגלים: dials:[{label, values:[...]}], answer:[...], onDone, why, explain. אחרי שני ניסיונות שגויים התשובה מתגלה עם ההסבר */
API.dials=(el,o)=>{const w=mk("div","w-dials"),idx=o.dials.map(()=>0);
  o.dials.forEach((d,i)=>{const box=mk("div","w-dial"),up=mk("button","w-mini","▲"),v=mk("div","v",d.values[0]),dn=mk("button","w-mini","▼");
    up.setAttribute("aria-label",`${d.label||"גלגל "+(i+1)}: הבא`);dn.setAttribute("aria-label",`${d.label||"גלגל "+(i+1)}: הקודם`);v.setAttribute("aria-live","polite");
    const turn=s=>{idx[i]=(idx[i]+s+d.values.length)%d.values.length;v.textContent=d.values[idx[i]];v.classList.add("spin");setTimeout(()=>v.classList.remove("spin"),150);API.click();o.onChange&&o.onChange(idx.map((x,j)=>o.dials[j].values[x]));};
    up.onclick=()=>turn(1);dn.onclick=()=>turn(-1);box.append(up,v,dn);if(d.label)box.appendChild(mk("small","",d.label));w.appendChild(box);});
  el.append(w,checkBtn(o.check||"פתיחה",()=>{const val=idx.map((x,j)=>String(o.dials[j].values[x]));
    const fin=()=>(o.onDone||(()=>API.solve()))();if(val.join("|")===o.answer.map(String).join("|")){fin();return;}w.tries=(w.tries||0)+1;API.fail(o.why||"המנעול לא נפתח. בדקו שוב את הממצאים מהחדרים.");
    if(w.tries>=(o.maxTries||2)){w.querySelectorAll("button").forEach(b=>b.disabled=true);el.querySelectorAll(".row .btn").forEach(b=>b.hidden=true);API.reveal(el,{answer:o.answer.join(" "),explain:o.explain,onDone:fin});}}));return w;};
/* כיוונון משתנים: vars:[{label,unit,min,max,step,start}], onChange(vals), check(vals)->{ok,msg,bad:[אינדקסים שגויים]}, onDone */
API.tuner=(el,o)=>{const w=mk("div","w-tuner"),vals=o.vars.map(v=>v.start);
  const upd=()=>{o.onChange&&o.onChange(vals.slice());};
  o.vars.forEach((v,i)=>{const row=mk("div","w-var",`<span>${v.label}</span>`),ctl=mk("div","ctl"),m=mk("button","w-mini","−"),p=mk("button","w-mini","+"),out=mk("span","v num"),rg=mk("input");
    rg.type="range";rg.min=v.min;rg.max=v.max;rg.step=v.step;rg.value=v.start;rg.setAttribute("aria-label",v.label);m.setAttribute("aria-label",v.label+": פחות");p.setAttribute("aria-label",v.label+": יותר");
    const set=x=>{x=Math.min(v.max,Math.max(v.min,Math.round(x/v.step)*v.step));vals[i]=+x.toFixed(4);rg.value=vals[i];out.textContent=vals[i]+(v.unit||"");upd();};
    m.onclick=()=>{API.click();set(vals[i]-v.step);};p.onclick=()=>{API.click();set(vals[i]+v.step);};rg.oninput=()=>set(+rg.value);
    out.textContent=v.start+(v.unit||"");ctl.append(m,out,p);row.append(ctl,rg);w.appendChild(row);});
  el.append(w,checkBtn(o.checkLabel,()=>{const r=o.check(vals.slice()),rows=[...w.children];if(r.bad)rows.forEach((x,i)=>{x.classList.remove("good","bad");void x.offsetWidth;x.classList.add(r.bad.includes(i)?"bad":"good");});if(r.ok)(o.onDone||(()=>API.solve(r.msg)))();else API.fail(r.msg);}));upd();return w;};
/* גרף נתונים: xs:[...], series:[{name,values,color}], yMin,yMax,yStep, xLabel,yLabel, threshold:{value,label}, pick, onPick(i), states:[מצב לכל נקודה], stateColors:{מצב:צבע}. עם states כל נקודה נצבעת לפי המצב שלה, ומופיע מקרא */
API.graph=(el,o)=>{const W=640,H=340,L=58,R=18,T=18,B=58,ns="http://www.w3.org/2000/svg",cs=getComputedStyle(document.documentElement);
  const X=i=>L+(W-L-R)*(o.xs.length<2?.5:i/(o.xs.length-1)),Y=v=>T+(H-T-B)*(1-(v-o.yMin)/(o.yMax-o.yMin));
  const svg=document.createElementNS(ns,"svg");svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.setAttribute("class","w-graph");svg.setAttribute("role","img");svg.setAttribute("aria-label",o.title||"גרף");
  const add=(t,a,txt)=>{const e=document.createElementNS(ns,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;svg.appendChild(e);return e;};
  const line=cs.getPropertyValue("--line"),main=cs.getPropertyValue("--main"),warm=cs.getPropertyValue("--warm"),alert=cs.getPropertyValue("--alert");
  for(let v=o.yMin;v<=o.yMax+1e-9;v+=o.yStep){add("line",{x1:L,x2:W-R,y1:Y(v),y2:Y(v),stroke:line,"stroke-width":1});add("text",{x:L-8,y:Y(v)+4,"text-anchor":"end"},+v.toFixed(2));}
  const every=Math.ceil(o.xs.length/12);o.xs.forEach((x,i)=>{if(i%every===0||i===o.xs.length-1){add("line",{x1:X(i),x2:X(i),y1:H-B,y2:H-B+6,stroke:line});add("text",{x:X(i),y:H-B+22,"text-anchor":"middle"},x);}});
  add("line",{x1:L,x2:W-R,y1:H-B,y2:H-B,stroke:"#fff","stroke-width":1.5});add("line",{x1:L,x2:L,y1:T,y2:H-B,stroke:"#fff","stroke-width":1.5});
  if(o.xLabel)add("text",{x:(L+W-R)/2,y:H-10,"text-anchor":"middle",direction:"rtl"},o.xLabel);
  if(o.yLabel)add("text",{x:16,y:(T+H-B)/2,"text-anchor":"middle",transform:`rotate(-90 16 ${(T+H-B)/2})`,direction:"rtl"},o.yLabel);
  if(o.threshold){const ty=Y(o.threshold.value);add("line",{x1:L,x2:W-R,y1:ty,y2:ty,stroke:alert,"stroke-width":2,"stroke-dasharray":"8 6"});if(o.threshold.label)add("text",{x:W-R-4,y:ty-6,"text-anchor":"start",fill:alert,direction:"rtl"},o.threshold.label);}
  let sel=null;(o.series||[]).forEach((s,si)=>{const col=s.color||(si?warm:main);add("polyline",{points:s.values.map((v,i)=>`${X(i)},${Y(v)}`).join(" "),fill:"none",stroke:col,"stroke-width":3,"stroke-linejoin":"round"});
    s.values.forEach((v,i)=>{const st=si===0&&o.states?o.states[i]:null,fc=(st&&o.stateColors&&o.stateColors[st])||col;const c=add("circle",{cx:X(i),cy:Y(v),r:o.pick||st?7:4,fill:fc,stroke:st?"#fff":"none","stroke-width":st?1.5:0,class:"pt"});
      const lab=`${o.xs[i]}: ${v}${st?" | "+st:""}`;const t=document.createElementNS(ns,"title");t.textContent=lab;c.appendChild(t);
      if(o.pick){c.setAttribute("tabindex","0");c.setAttribute("role","button");c.setAttribute("aria-label",lab);
        const f=()=>{API.click();if(sel)sel.classList.remove("sel");sel=c;c.classList.add("sel");o.onPick&&o.onPick(i,o.xs[i],v,si);};c.onclick=f;c.onkeydown=e=>onKey(e,f);}});});
  if(o.states&&o.stateColors){Object.keys(o.stateColors).forEach((k,ki)=>{add("circle",{cx:L+18+ki*110,cy:T+11,r:7,fill:o.stateColors[k],stroke:"#fff","stroke-width":1.5});add("text",{x:L+30+ki*110,y:T+16,"text-anchor":"start"},k);});}
  if((o.series||[]).length>1){(o.series).forEach((s,si)=>{add("rect",{x:W-R-18-si*160,y:T+4,width:14,height:14,rx:3,fill:s.color||(si?warm:main)});add("text",{x:W-R-24-si*160,y:T+16,direction:"rtl","text-anchor":"start"},s.name);});}
  el.appendChild(svg);return svg;};
/* בניית מודל בכמויות: model: HTML עם אלמנטים data-zone (data-layout="ring" מסדר את החלקים במעגל, כמו אלקטרונים ברמת אנרגיה), palette:[{id,label,html,cls}], allow:{zone:[ids]}, why:{"id@zone":"משוב"}, target:{zone:{id:מספר}}, onChange(counts), onDone */
API.build=(el,o)=>{let sel=null;const box=mk("div","w-model",o.model),pal=mk("div","w-pal"),counts={},n=()=>{const c={};Object.keys(counts).forEach(z=>c[z]=Object.assign({},counts[z]));return c;};
  el.appendChild(mk("p","w-hint",o.help||"בוחרים חלקיק ולוחצים על המקום שלו במודל (או גוררים). לחיצה על חלקיק שהונח מסירה אותו."));
  const zones=[...box.querySelectorAll("[data-zone]")];zones.forEach(z=>{counts[z.dataset.zone]={};z.classList.add("w-z");z.tabIndex=0;z.setAttribute("role","button");});
  const done=()=>{if(!o.target)return false;return Object.keys(o.target).every(z=>{const t=o.target[z],c=counts[z]||{};const ids=new Set([...Object.keys(t),...Object.keys(c)]);return [...ids].every(i=>(c[i]||0)===(t[i]||0));})&&Object.keys(counts).every(z=>o.target[z]||!Object.values(counts[z]).some(v=>v));};
  const ring=()=>zones.filter(z=>z.dataset.layout==="ring").forEach(z=>{const ts=[...z.querySelectorAll(".w-tok")];ts.forEach((t,i)=>{const a=2*Math.PI*i/ts.length-Math.PI/2;t.style.position="absolute";t.style.left=`calc(50% + ${Math.cos(a)*46}% - 15px)`;t.style.top=`calc(50% + ${Math.sin(a)*46}% - 15px)`;});});
  const report=()=>{ring();o.onChange?o.onChange(n()):API.status(o.palette.map(p=>`${p.label}: ${Object.values(counts).reduce((s,c)=>s+(c[p.id]||0),0)}`).join(" | "));
    if(!o.button&&done())setTimeout(()=>(o.onDone||(()=>API.solve()))(),500);};
  const put=z=>{if(!sel)return;const zid=z.dataset.zone,p=sel;if(o.allow&&o.allow[zid]&&!o.allow[zid].includes(p.id)){API.fail((o.why&&o.why[p.id+"@"+zid])||"החלק הזה לא שייך לכאן.");return;}
    const t=mk("span","w-tok "+(p.cls||""),p.html||p.label);t.title="לחיצה מסירה";t.tabIndex=0;t.setAttribute("role","button");t.setAttribute("aria-label",p.label+" (לחיצה מסירה)");
    const rm=e=>{e.stopPropagation();t.remove();counts[zid][p.id]--;API.click();report();};t.onclick=rm;t.onkeydown=e=>{if(e.key==="Enter"||e.key===" ")rm(e);};
    z.appendChild(t);counts[zid][p.id]=(counts[zid][p.id]||0)+1;API.click();report();};
  zones.forEach(z=>{z.onclick=()=>put(z);z.onkeydown=e=>{if(e.target===z)onKey(e,()=>put(z));};z.ondragover=e=>{e.preventDefault();z.classList.add("over");};z.ondragleave=()=>z.classList.remove("over");z.ondrop=e=>{e.preventDefault();z.classList.remove("over");put(z);};});
  o.palette.forEach(p=>{const b=mk("button","w-src",`<span class="w-tok ${p.cls||""}">${p.html||p.label}</span>${p.label}`);b.draggable=true;
    const pick=()=>{pal.querySelectorAll(".sel").forEach(x=>x.classList.remove("sel"));sel=p;b.classList.add("sel");API.click();};b.onclick=pick;b.ondragstart=pick;pal.appendChild(b);});
  const rs=mk("button","icon-btn","איפוס");rs.onclick=()=>{zones.forEach(z=>{z.querySelectorAll(".w-tok").forEach(t=>t.remove());counts[z.dataset.zone]={};});report();};
  el.append(box,pal);const row=mk("div","row");row.appendChild(rs);el.appendChild(row);
  if(o.button)el.appendChild(checkBtn(o.button,()=>done()?(o.onDone||(()=>API.solve()))():API.fail(o.wrong||"המודל עדיין לא נכון. בדקו את הכמויות.")));report();return box;};
/* לוח בחירה עם הסקה: tiles:[{label,sub,note,disabled}], answer:"label", wrong:{label:"משוב"}, why, explain, cols. אחרי שתי בחירות שגויות התשובה הנכונה מתגלה עם ההסבר (explain), וממשיכים */
API.grid=(el,o)=>{let sel=null;const g=mk("div","w-grid");g.style.gridTemplateColumns=`repeat(auto-fill,minmax(${o.size||64}px,1fr))`;
  const row=mk("div","row"),go=mk("button","btn",o.confirm||"אישור");go.hidden=true;
  o.tiles.forEach(t=>{const b=mk("button","w-tile",`${t.sub!=null?`<small>${t.sub}</small>`:""}${t.label}${t.note?`<em>${t.note}</em>`:""}`);b.disabled=!!t.disabled;b.setAttribute("aria-label",[t.label,t.sub,t.note].filter(x=>x!=null).join(" "));
    b.onclick=()=>{API.click();g.querySelectorAll(".sel").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");sel=t;go.hidden=false;go.textContent=(o.confirm||"אישור")+": "+t.label;};g.appendChild(b);});
  let tries=0;const fin=()=>(o.onDone||(()=>API.solve()))();
  go.onclick=()=>{if(!sel)return;if(String(sel.label)===String(o.answer)){fin();return;}tries++;API.fail((o.wrong&&o.wrong[sel.label])||o.why||"לא זה. בדקו את החישוב שוב.");
    if(tries>=(o.maxTries||2)){g.querySelectorAll(".w-tile").forEach(b=>{b.disabled=true;if(b.getAttribute("aria-label").split(" ")[0]===String(o.answer))b.classList.add("sel");});go.hidden=true;API.reveal(el,{answer:o.answer,explain:o.explain,onDone:fin});}};
  row.appendChild(go);el.append(g,row);return g;};
/* צפייה ובדיקה: questions:[{q, opts:[...], a:אינדקס, why:[משוב לכל אפשרות], hint, explain}], onDone. טעות נפסלת וממשיכים לנסות. רמז אחרי טעות ראשונה. אחרי שתי טעויות התשובה הנכונה מתגלה עם ההסבר (explain), וממשיכים */
API.quiz=(el,o)=>{const w=mk("div","w-quiz");let qi=0;el.appendChild(w);
  const show=()=>{const Q=o.questions[qi];let tries=0;w.innerHTML=`<div class="prog">שאלה <span class="num">${qi+1}</span> מתוך <span class="num">${o.questions.length}</span></div><div class="q">${Q.q}</div>`;
    const hint=mk("div","hint");hint.hidden=true;hint.innerHTML="<strong>רמז:</strong> "+(Q.hint||"");
    Q.opts.forEach((t,i)=>{const b=mk("button","w-opt",t);b.onclick=()=>{if(i===Q.a){b.classList.add("good");w.querySelectorAll(".w-opt").forEach(x=>x.disabled=true);API.status(Q.ok||"נכון!");API.click();
        const nx=mk("button","btn",qi<o.questions.length-1?"לשאלה הבאה":"סיום");nx.onclick=()=>{qi++;qi<o.questions.length?show():(o.onDone||(()=>API.solve()))();};const r=mk("div","row");r.appendChild(nx);w.appendChild(r);nx.focus();}
      else{b.classList.add("bad");b.disabled=true;tries++;API.fail((Q.why&&Q.why[i])||"לא נכון, נסו שוב.");if(tries===1&&Q.hint)hint.hidden=false;
        if(tries>=(o.maxTries||2)){const ok=w.querySelectorAll(".w-opt")[Q.a];ok.classList.add("good");w.querySelectorAll(".w-opt").forEach(x=>x.disabled=true);hint.hidden=true;
          API.reveal(w,{answer:Q.opts[Q.a],explain:Q.explain||(Q.why&&Q.why[Q.a]),label:qi<o.questions.length-1?"לשאלה הבאה":"סיום",onDone:()=>{qi++;qi<o.questions.length?show():(o.onDone||(()=>API.solve()))();}});}}};w.appendChild(b);});
    w.appendChild(hint);};show();return w;};
/* גילוי התשובה אחרי שתי טעויות: answer, explain, label, onDone. משמש את quiz, grid ו-dials, ואת onPick של graph */
API.reveal=(el,o)=>{const r=mk("div","reveal");r.setAttribute("role","status");r.innerHTML=`<strong>התשובה הנכונה: ${o.answer}</strong>${o.explain?`<div>למה: ${o.explain}</div>`:""}`;
  const nx=mk("button","btn",o.label||"ממשיכים");nx.onclick=()=>{nx.disabled=true;o.onDone&&o.onDone();};const row=mk("div","row");row.appendChild(nx);r.appendChild(row);el.appendChild(r);nx.focus();return r;};
/* פעולת סיום: label, onDone */
API.finalSwitch=(el,o)=>{const b=mk("button","w-switch",o.label||"הפעלה");b.onclick=()=>{b.disabled=true;b.classList.add("off");sfx("win");setTimeout(()=>(o.onDone||(()=>API.solve()))(),1200);};el.appendChild(b);return b;};
function timeUp(){ $("#stage").innerHTML=`<section class="view panel" style="text-align:center"><h2>הזמן נגמר</h2><p>${GAME.timeUpText}</p>
  <div class="row" style="justify-content:center"><button class="btn big" id="again">מנסים שוב</button></div></section>`; $("#again").onclick=restart; }
function victory(){ clearInterval(timerId); steps(); sfx("win"); confetti();
  $("#stage").innerHTML=`<section class="view panel" style="text-align:center"><h2>${GAME.victory.title}</h2>${briefBox(`<p>${GAME.victory.text}</p>`)}
  <div class="row" style="justify-content:center"><button class="btn big warm" id="again">משחקים שוב</button></div></section>`; $("#again").onclick=restart; }
function confetti(){ if(matchMedia("(prefers-reduced-motion: reduce)").matches) return; const c=$("#confetti"); c.innerHTML="";
  const cols=[getComputedStyle(document.documentElement).getPropertyValue("--main"),getComputedStyle(document.documentElement).getPropertyValue("--warm"),"#fff"];
  for(let i=0;i<60;i++){ const p=document.createElement("i"); p.style.cssText=`right:${Math.random()*100}%;background:${cols[i%3]};animation-duration:${2+Math.random()*2}s;animation-delay:${Math.random()*.6}s`; c.appendChild(p); }
  setTimeout(()=>c.innerHTML="",5000); }
function restart(){ clearInterval(timerId); secs=GAME.minutes*60; extended=false; $("#timer").hidden=true; closeModal(); ROOMS.forEach(r=>r.reset&&r.reset()); intro(); }
$("#sound-btn").onclick=e=>{ sound=!sound; e.target.textContent="צליל: "+(sound?"פועל":"כבוי"); e.target.setAttribute("aria-pressed",sound); };
if(GAME.tool && GAME.tool.label){ const b=$("#tool-btn"); b.hidden=false; b.textContent=GAME.tool.label;
  b.onclick=()=>{ showModal(`${GAME.tool.html}<div class="row" style="justify-content:center"><button class="btn" id="close-tool">סגירה</button></div>`); $("#close-tool").onclick=closeModal; }; }
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && $("#close-tool")) closeModal(); });
/* אווירת רקע: Canvas מחליף לפי מפרט העיצוב (בועות, חלקיקים, קרני אור...) */
(function ambient(){ const a=$("#ambient"); for(let i=0;i<16;i++){ const s=document.createElement("span"), z=5+Math.random()*14;
  s.style.cssText=`position:absolute;bottom:-20px;right:${Math.random()*100}%;width:${z}px;height:${z}px;border-radius:50%;background:rgba(255,255,255,.14);animation:rise ${9+Math.random()*9}s linear ${-Math.random()*9}s infinite`; a.appendChild(s);} })();
document.head.insertAdjacentHTML("beforeend","<style>@keyframes rise{to{transform:translateY(-115vh)}}</style>");
intro();
