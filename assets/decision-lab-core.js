/* Decision Lab: deterministic, side-effect-free payment timing simulator. */
(function(root){
"use strict";
const amount=x=>Number.isFinite(Number(x))?Number(x):0;
const copy=value=>JSON.parse(JSON.stringify(value));
const minimum=(state,series)=>Math.min(amount(state.balance),...series.map(x=>x.balance));
function evaluate(state,invoiceId,engine,decisionEngine,opts={}){
  if(!state||!Array.isArray(state.invoices))throw new Error("Missing SME ledger");
  const invoice=state.invoices.find(x=>Number(x.id)===Number(invoiceId));
  if(!invoice)throw new Error("Invoice not found");
  const mode=["base","stress","growth"].includes(opts.mode)?opts.mode:"base";
  const buffer=Math.max(0,amount(opts.buffer??100000));
  const decision=decisionEngine.assess(invoice,state,engine);
  const cases=[
    {id:"now",name:"Pay now",explanation:"Hypothetical immediate cash deduction before next week's revenue; requires full approval."},
    {id:"due",name:"Pay on scheduled week",explanation:"Leave invoice in its existing due week; no acceleration or deferral."},
    {id:"defer",name:"Request 2-week extension",explanation:"Hypothetical supplier-agreed change, never automatically applied."}
  ].map(opt=>{
    const next=copy(state);
    const candidate=next.invoices.find(x=>Number(x.id)===Number(invoiceId));
    if(opt.id==="now"){
      next.balance=amount(next.balance)-amount(candidate.amount);
      candidate.status="paid";
    }else if(opt.id==="defer"&&["pending","under_review","verified","approved"].includes(candidate.status)){
      candidate.due=amount(candidate.due)+2;
    }
    const series=engine.forecast(next,mode);
    const floor=minimum(next,series);
    const weekBelow=series.filter(x=>x.balance<buffer).map(x=>x.week);
    return {...opt,startingCash:next.balance,lowestCash:floor,closingCash:series.at(-1).balance,
      weeksBelowBuffer:weekBelow,dueWeek:candidate.due,
      beyondHorizon:opt.id==="defer"&&candidate.due>8,
      path:series.map(x=>({week:x.week,balance:x.balance})),
      hypothetical:true};
  });
  const now=cases[0],due=cases[1];
  let status="REVIEW TIMING",advice="Compare the simulated liquidity impact and confirm the contractual due date before approving.";
  if(invoice.status==="rejected"){
    status="REJECTED — NOT PAYABLE";advice="This invoice was rejected; hypothetical payment comparisons are informational only.";
  }else if(invoice.status==="paid"){
    status="ALREADY RECORDED";advice="This is a previously simulated payment. Do not make another payment.";
  }else if(decision.key==="invoice_approval"){
    status="INVOICE APPROVAL REQUIRED";advice="First review and approve this invoice in Invoice Intelligence; all timing alternatives here are hypothetical.";
  }else if(decision.key==="verify"){
    status="HOLD — VERIFY FIRST";advice="Resolve invoice and bank-detail warnings independently. Timing scenarios are planning illustrations, not permission to pay.";
  }else if(decision.key==="cash"){
    status="HOLD — INSUFFICIENT CASH";advice="Available cash is below this invoice amount. Reconcile liquidity before arranging payment.";
  }else if(decision.key==="owner"){
    status="OWNER REVIEW REQUIRED";advice="A staff member cannot authorize a release. Request explicit owner review.";
  }else if(now.lowestCash<buffer&&due.lowestCash>=buffer){
    status="AVOID EARLY PAYMENT";advice="Paying immediately breaches the illustrative cash reserve while paying on the scheduled week does not. Keep the agreed due date unless the business owner decides otherwise.";
  }else if(now.lowestCash<buffer){
    status="CASH BUFFER AT RISK";advice="Immediate payment drops simulated cash below the reserve. Assess funding or renegotiate timing; do not treat a supplier extension as guaranteed.";
  }else{
    status="ELIGIBLE FOR OWNER REVIEW";advice="Current simulated funds meet the chosen reserve. Verify invoice and payment details, then obtain explicit owner approval.";
  }
  return {invoice:copy(invoice),mode,buffer,riskScore:decision.riskScore,riskLevel:decision.riskLevel,
    decisionKey:decision.key,status,advice,cases,assessment:decision,
    notes:["These numbers depend entirely on synthetic financial inputs.",
      "A supplier must agree to any extension; past-due fees and contractual penalties are not modeled.",
      "Pay now is hypothetical, not an executable instruction. No transaction occurs.",
      "A two-week extension past week 8 moves the outflow outside the chart, not out of the liability."]};
}
root.LedgertantDecisionLabCore=Object.freeze({evaluate});
})(globalThis);
