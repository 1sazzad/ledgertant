/* Guided offline SME storytelling layer. Presentation state is transient; scenario data is local. */
(function(root){
"use strict";
let scenario="fraud",tourActive=false,tourIndex=0,tourFinished=false,expandedResult="";
const CORE=root.LedgertantJourney;
if(!CORE)throw new Error("LedgertantJourney must be loaded first");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>(n<0?"−৳":"৳")+Math.round(Math.abs(n)).toLocaleString("en-BD");
function navigate(view){
  if(!document.getElementById(view))return;
  current=view;render();
  if(typeof window!=="undefined"&&window.scrollTo)window.scrollTo({top:0,behavior:"smooth"});
}
function metric(label,value,sub,kind=""){
  return '<div class="journey-metric '+esc(kind)+'"><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(sub)+'</small></div>';
}
function scenarioCard(key){
 const c=CORE.scenarios[key];
 return '<button class="scenario-card '+(scenario===key?"selected":"")+'" type="button" data-experience="scenario" data-kind="'+key+'" aria-pressed="'+(scenario===key)+'"><span class="scenario-dot '+esc(c.accent)+'"></span><span><strong>'+esc(c.name)+'</strong><small>'+esc(c.subtitle)+'</small></span><span aria-hidden="true">↗</span></button>';
}
function storySteps(){
  return [
   ["01","Catch the suspicious invoice","Review supplier identity, duplicate references and unusual amounts.","invoices","Investigate risk →"],
   ["02","Understand the cash impact","See the next eight weeks and stress-test revenue.","cashflow","Model cash →"],
   ["03","Get funding direction","Compare illustrative financing paths without applying for credit.","financing","Explore options →"],
   ["04","Protect the payment","Check permissions, simulate approvals and record the evidence.","security","Test safeguards →"]
  ].map(([num,title,desc,view,action])=>'<div class="story-step"><span class="step-number">'+num+'</span><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p><button class="link-action" data-experience="view" data-view="'+view+'">'+esc(action)+'</button></div>').join("");
}
function evidenceResults(){
 const m=CORE.impact(state,LedgertantEngine);
 const cards=[
  ["fraud","Invoice screening",m.flaggedCount+" warnings","Warnings require investigation, not proof of fraud.","invoices"],
  ["cash","Cash under stress",fmt(m.stressLow),"This is an illustrative eight-week model with reduced revenue, not a validated forecast.","cashflow"],
  ["payments","Simulated payment outcomes",m.paymentsMade+" payments","All approvals and payments are browser-only simulations; no funds move.","payments"],
  ["audit","Decision evidence",m.auditEvents+" logged actions","Audit entries are locally stored, not tamper-proof.","audit"]
 ];
 return '<div class="section"><span class="eyebrow">04 / EXPLORE THE OUTCOME</span><h2>Interactive result breakdown</h2><p class="muted">Select a result card to understand it, then open the supporting module.</p><div class="result-list">'+cards.map(c=>'<div><button class="result-entry" aria-expanded="'+(expandedResult===c[0])+'" data-experience="result" data-result="'+c[0]+'"><strong>'+esc(c[1])+' · '+esc(c[2])+'</strong><small>Explore this outcome '+(expandedResult===c[0]?'−':'+')+'</small></button>'+(expandedResult===c[0]?'<div class="result-detail"><h4>What this means</h4><p>'+esc(c[3])+'</p><button class="btn secondary" data-experience="view" data-view="'+c[4]+'">View supporting evidence →</button></div>':'')+'</div>').join('')+'</div></div>';
}
function renderJourney(){
 const target=document.getElementById("journey");if(!target)return;
 const m=CORE.impact(state,LedgertantEngine);
 const details=CORE.scenarios[scenario]||CORE.scenarios.fraud;
 target.innerHTML='<div class="journey-hero"><span class="eyebrow">THE LEDGERTANT EXPERIENCE · SYNTHETIC SME</span><h2>One decision. A ripple across your business.</h2><p>Imagine a small retailer facing an urgent supplier invoice. Is it legitimate? Can the business afford it? Who is allowed to release the money? Ledgertant links all three questions.</p><div class="toolbar"><button class="btn" data-experience="start">▶ Start 3-minute guided demo</button><button class="btn outline" data-experience="report">↓ Export demo brief</button></div><span class="tiny-legal">Interactive simulation — no real banking data, actual AI model, or transfers.</span></div>'+
 '<div class="section"><div class="section-heading"><div><span class="eyebrow">01 / CHOOSE A SITUATION</span><h2>Explore three realistic SME stories</h2><p class="muted">Each option restores a different synthetic dataset in your browser. Switching discards your current demo changes after confirmation.</p></div></div><div class="scenario-grid">'+Object.keys(CORE.scenarios).map(scenarioCard).join("")+'</div></div>'+
 '<div class="section"><span class="eyebrow">02 / MEASURE THE SITUATION</span><h2>What is happening to this business?</h2><div class="impact-grid">'+
 metric("Unpaid invoices",String(m.pendingCount),"Waiting for review")+
 metric("Invoices flagged",String(m.flaggedCount),"Rule-based screening results",m.flaggedCount?"alert":"")+
 metric("Invoice value flagged",fmt(m.flaggedExposure),"Review exposure — not confirmed loss",m.flaggedCount?"alert":"")+
 metric("Duplicate-reference exposure",fmt(m.duplicateExposure),"Excess repeated reference amount")+
 metric("Lowest base-case cash",fmt(m.weeklyLow),"Eight-week projected floor",m.weeklyLow<0?"alert":"")+
 metric("Lowest stress-case cash",fmt(m.stressLow),"Assumes 35% lower weekly sales",m.stressLow<0?"alert":"")+
 '</div><p class="footnote">All numbers are derived from the loaded synthetic scenario. No score is a calibrated fraud probability; review exposure is not money saved.</p></div>'+
 '<div class="section"><span class="eyebrow">03 / FOLLOW THE DECISION</span><h2>One connected financial journey</h2><div class="story-grid">'+storySteps()+'</div></div>'+
 '<div class="section"><div class="grid g2"><div class="card"><span class="eyebrow">WITHOUT CONTROLS</span><h3>Fragmented decisions</h3><p class="muted">An invoice arrives by email. The owner separately checks accounting sheets, messages a supplier, estimates bank liquidity and approves a payment with limited visibility.</p></div><div class="card journey-outcome"><span class="eyebrow">WITH LEDGERTANT</span><h3>One auditable review sequence</h3><p>Review invoice warnings → assess cash consequences → compare choices → require human authorization → record simulated decisions.</p></div></div></div>'+evidenceResults();
}
function renderBanner(){
 const target=document.getElementById("overview");if(!target)return;
 const m=CORE.impact(state,LedgertantEngine),info=CORE.scenarios[scenario]||CORE.scenarios.fraud;
 target.insertAdjacentHTML("afterbegin",'<div class="demo-mission"><div><span class="eyebrow">CURRENT DEMONSTRATION · FICTIONAL SME</span><h2>'+esc(info.name)+'</h2><p>'+esc(info.subtitle)+'</p><div class="mini-metrics"><span><b>'+m.flaggedCount+'</b> invoices need review</span><span><b>'+fmt(m.flaggedExposure)+'</b> flagged amount</span><span><b>'+fmt(m.stressLow)+'</b> stress-case cash floor</span></div></div><div class="mission-actions"><button class="btn" data-experience="start">▶ Guided walkthrough</button><button class="btn outline" data-experience="view" data-view="journey">Explore SME stories</button></div></div>');
 const badge=document.getElementById("scenarioBadge");if(badge)badge.textContent="Scenario: "+info.name;
}
function ensureTour(){
 let el=document.getElementById("ledgertantTour");if(!el){el=document.createElement("aside");el.id="ledgertantTour";el.className="tour-panel";el.setAttribute("aria-label","Guided demonstration");document.body.appendChild(el)}return el;
}
function renderTour(){
 const el=ensureTour();
 if(!tourActive){el.hidden=true;el.innerHTML="";return}
 const step=CORE.steps[tourIndex],count=CORE.steps.length;
 el.hidden=false;
 el.innerHTML='<div class="tour-head"><span class="eyebrow">LIVE JUDGE WALKTHROUGH</span><button aria-label="Close guided walkthrough" data-experience="close" class="close-tour">✕</button></div><div class="tour-progress" role="progressbar" aria-valuenow="'+(tourIndex+1)+'" aria-valuemin="1" aria-valuemax="'+count+'" aria-label="Tour step"><span style="width:'+Math.round((tourIndex+1)/count*100)+'%"></span></div><div class="tour-counter">STEP '+(tourIndex+1)+' OF '+count+'</div><h3>'+esc(step.title)+'</h3><p>'+esc(step.detail)+'</p><div class="notice">'+esc(tourIndex===4?'Action: set actor to Finance staff, choose Release payment, and evaluate. Expect BLOCK with an explanation.':tourIndex===5?'Action: open Should I pay? for a flagged invoice. HOLD means stop and verify. Owner confirmation is required even for eligible invoices.':tourIndex===6?'Action: inspect decision evidence, export the audit CSV and explore expandable result cards in Demo experience.':'Action: inspect this module and explain the evidence before continuing.')+'</div><button class="btn outline tour-open" data-experience="view" data-view="'+esc(step.key)+'">'+esc(step.action)+' ↗</button><div class="tour-footer"><button class="btn secondary" '+(tourIndex===0?"disabled":"")+' data-experience="prev">← Back</button><button class="btn" data-experience="next">'+(tourIndex===count-1?"Finish tour ✓":"Next step →")+'</button></div>';
}
function render(){
 renderJourney();renderBanner();renderTour();
 if(tourFinished){
  const target=document.getElementById("journey");
  if(target)target.insertAdjacentHTML("afterbegin",'<div class="journey-finished" role="status">✓ Demo walkthrough finished. You can replay the story or export the synthetic evidence brief.</div>');
 }
}
function chooseScenario(kind){
 if(!CORE.scenarios[kind])return;
 if(!confirm("Load '"+CORE.scenarios[kind].name+"'? This replaces the current synthetic invoices, cash settings and local audit trail."))return;
 state=CORE.makeScenario(initial(),kind);
 scenario=kind;tourFinished=false;tourActive=false;tourIndex=0;
 log("DEMO SCENARIO","Loaded "+CORE.scenarios[kind].name+" (synthetic data)");
 render();
}
function downloadReport(){
 const text=CORE.report(state,LedgertantEngine,scenario),blob=new Blob([text],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="ledgertant-demo-brief.txt";document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener("click",event=>{
 const el=event.target.closest("[data-experience]");if(!el)return;
 const action=el.dataset.experience;
 if(action==="start"){tourActive=true;tourIndex=0;tourFinished=false;navigate(CORE.steps[0].key);}
 else if(action==="next"){if(tourIndex>=CORE.steps.length-1){tourActive=false;tourFinished=true;navigate("journey")}else{tourIndex++;navigate(CORE.steps[tourIndex].key)}}
 else if(action==="prev"){tourIndex=Math.max(0,tourIndex-1);navigate(CORE.steps[tourIndex].key)}
 else if(action==="close"){tourActive=false;renderTour()}
 else if(action==="scenario")chooseScenario(el.dataset.kind);
 else if(action==="view")navigate(el.dataset.view);
 else if(action==="report")downloadReport();
 else if(action==="result"){expandedResult=expandedResult===el.dataset.result?"":el.dataset.result;renderJourney()}
});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&tourActive){tourActive=false;renderTour()}});
root.LedgertantExperience=Object.freeze({render,navigate,impact:()=>CORE.impact(state,LedgertantEngine),getScenario:()=>scenario});
render();
})(globalThis);
