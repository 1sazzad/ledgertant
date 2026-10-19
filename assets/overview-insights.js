/* Read-only business KPI explanations for the offline demo. */
(function(root){
"use strict";
const number=n=>Number.isFinite(Number(n))?Number(n):0;
function inspect(state,engine){
  if(!state||!engine)throw new Error("Missing demo data or calculation engine");
  const all=Array.isArray(state.invoices)?state.invoices:[];
  const unpaid=all.filter(i=>i.status==="pending"||i.status==="verified");
  const entries=unpaid.map(i=>{
    const r=engine.scoreInvoice(i,all,state.suppliers||[]);
    return {id:i.id,ref:String(i.ref),supplier:String(i.supplier),amount:number(i.amount),
      dueWeek:number(i.due),status:String(i.status),riskScore:r.score,level:r.level,
      reasons:r.reasons.slice()};
  });
  const alerts=entries.filter(x=>x.level!=="low").sort((a,b)=>b.riskScore-a.riskScore||a.id-b.id);
  const base=engine.forecast(state,"base");
  const stress=engine.forecast(state,"stress");
  const baseLowest=Math.min(...base.map(x=>x.balance));
  const stressLowest=Math.min(...stress.map(x=>x.balance));
  const baseLowWeek=base.find(x=>x.balance===baseLowest)?.week??null;
  const totalUnpaid=entries.reduce((a,x)=>a+x.amount,0);
  const riskTotals={high:alerts.filter(x=>x.level==="high").length,
    medium:alerts.filter(x=>x.level==="medium").length};
  const dueSoon=entries.filter(x=>x.dueWeek<=2);
  return {balance:number(state.balance),weeklyIncome:number(state.weeklyIncome),
    weeklyOperating:number(state.weeklyOperating),unpaidCount:entries.length,
    totalUnpaid,entries,alerts,alertCount:alerts.length,riskTotals,
    baseLow:baseLowest,baseLowWeek,stressLow:stressLowest,
    dueSoonCount:dueSoon.length,dueSoonValue:dueSoon.reduce((a,x)=>a+x.amount,0),
    weeks:base.map(x=>({week:x.week,balance:x.balance,invoiceOut:x.invoiceOut}))};
}
root.LedgertantOverviewInsights=Object.freeze({inspect});
})(globalThis);
