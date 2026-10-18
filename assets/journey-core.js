/* Ledgertant phase-three presentation fixtures and impact calculations.
   Synthetic scenarios and business indicators only; not validated savings. */
(function(root){
"use strict";
const clone=x=>JSON.parse(JSON.stringify(x));
const scenarios=Object.freeze({
  fraud:{name:"Suspicious supplier payment",subtitle:"A duplicate invoice and a last-minute bank-account change threaten an SME's cash.",icon:"shield-alert",accent:"risk"},
  squeeze:{name:"Cash-flow squeeze",subtitle:"Sales fall while operating bills and supplier invoices remain due.",icon:"trending-down",accent:"stress"},
  healthy:{name:"Healthy operating month",subtitle:"A well-funded business demonstrates low-friction approval of ordinary invoices.",icon:"badge-check",accent:"steady"}
});
function makeScenario(base,kind){
  if(!scenarios[kind])throw new Error("Unknown scenario: "+String(kind));
  const next=clone(base);
  next.audit=[];next.role="owner";
  if(kind==="squeeze"){next.balance=140000;next.weeklyIncome=76000;next.weeklyOperating=108000;}
  if(kind==="healthy"){
    next.balance=720000;next.weeklyIncome=245000;next.weeklyOperating=95000;
    next.invoices=next.invoices.filter(i=>[1,2].includes(i.id));
  }
  return next;
}
function impact(state,engine){
  const waiting=(state.invoices||[]).filter(i=>i.status==="pending");
  const flags=waiting.map(i=>({invoice:i,risk:engine.scoreInvoice(i,state.invoices,state.suppliers)})).filter(v=>v.risk.score>=30);
  const high=flags.filter(v=>v.risk.level==="high");
  // Deduplicate by supplier + reference, retaining one legitimate reference as baseline.
  const seen=new Set();let repeatExposure=0,duplicates=0;
  for(const inv of state.invoices||[]){
    if(inv.status==="paid")continue;
    const k=String(inv.supplier).toLowerCase().trim()+"|"+String(inv.ref).toLowerCase().trim();
    if(seen.has(k)){repeatExposure+=Number(inv.amount)||0;duplicates++;}
    else seen.add(k);
  }
  const base=engine.forecast(state,"base"),stress=engine.forecast(state,"stress");
  const minimum=xs=>xs.length?Math.min(...xs.map(x=>x.balance)):0;
  return {
    pendingCount:waiting.length,flaggedCount:flags.length,highCount:high.length,
    flaggedExposure:flags.reduce((sum,v)=>sum+(Number(v.invoice.amount)||0),0),
    duplicateCount:duplicates,duplicateExposure:repeatExposure,
    weeklyLow:minimum(base),stressLow:minimum(stress),
    projectedGap:Math.max(0,100000-minimum(stress)),
    paymentsMade:(state.invoices||[]).filter(x=>x.status==="paid").length,
    auditEvents:(state.audit||[]).length
  };
}
const steps=[
 {key:"overview",title:"Start with the business challenge",detail:"Meet a fictional SME owner juggling supplier bills, cash pressure and fraudulent payment requests.",action:"Inspect the business overview"},
 {key:"invoices",title:"Identify invoice threats",detail:"Review duplicate BS-2401 and changed-bank IT-800. Each alert explains which rules triggered.",action:"Open invoice intelligence"},
 {key:"cashflow",title:"Understand cash consequences",detail:"Switch Base → Stress and show the impact of lower revenue while bills remain due.",action:"Open the cash-flow studio"},
 {key:"financing",title:"Explore funding decisions",detail:"Use the illustrative financing calculator to discuss cash-gap options—no lender is connected.",action:"Open financing options"},
 {key:"security",title:"Try an adversarial instruction",detail:"Insert an untrusted message asking to bypass approvals, then evaluate the blocked policy decision.",action:"Open the security lab"},
 {key:"payments",title:"Demonstrate approval controls",detail:"Try a staff-role payment, then an owner-role payment. Flagged invoices require review.",action:"Open payment controls"},
 {key:"audit",title:"Prove what happened",detail:"Review the local decision trail and export CSV evidence of simulated actions.",action:"Open the decision ledger"}
];
function report(state,engine,scenario){
 const i=impact(state,engine),fmt=x=>"BDT "+Math.round(x).toLocaleString("en-BD");
 return ["LEDGERTANT | SIMULATED SME DECISION BRIEF",
 "Scenario: "+(scenarios[scenario]?.name||"Custom data"),
 "Synthetic demonstration only; figures are NOT measured savings, loss estimates or live bank balances.",
 "","FINANCIAL POSITION",
 "Available demo cash: "+fmt(state.balance),
 "Pending invoices: "+i.pendingCount,
 "Flagged invoice count: "+i.flaggedCount,
 "Flagged face value: "+fmt(i.flaggedExposure)+" (review exposure, not a confirmed fraud loss)",
 "Duplicate-reference excess amount: "+fmt(i.duplicateExposure)+" (potential duplicate outflow, not proven savings)",
 "Minimum projected cash, base case: "+fmt(i.weeklyLow),
 "Minimum projected cash, -35% revenue stress: "+fmt(i.stressLow),
 "Illustrative buffer gap under stress: "+fmt(i.projectedGap),
 "","CONTROLS",
 "Simulated payments: "+i.paymentsMade,
 "Locally recorded decisions: "+i.auditEvents,
 "Fraud scores: deterministic rules, not ML probabilities.",
 "Payment authorizations: browser-side simulation; not security enforcement.",
 "No real transfers, lender offers, or bank connections are performed.",
 "","Next step for production: authenticated, server-verified permissions, consented bank data, validated fraud models, independent supplier checks, and licensed payment integrations."
 ].join("\n");
}
root.LedgertantJourney=Object.freeze({scenarios,makeScenario,impact,steps,report});
})(globalThis);
