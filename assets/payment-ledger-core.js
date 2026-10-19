/* Browser-only simulated payment ledger. Never issues a real transfer. */
(function(root){
"use strict";
const number=x=>Number.isFinite(Number(x))?Number(x):NaN;
function preview(state,invoiceId){
 if(!state||!Array.isArray(state.invoices))throw Error("Missing demo invoice ledger.");
 const invoice=state.invoices.find(i=>Number(i.id)===Number(invoiceId));
 if(!invoice)throw Error("Invoice not found.");
 const before=number(state.balance),amount=number(invoice.amount);
 if(!Number.isFinite(before)||before<0||!Number.isFinite(amount)||amount<=0)throw Error("Invalid demo balance or invoice amount.");
 return {id:invoice.id,ref:String(invoice.ref),supplier:String(invoice.supplier),amount,before,
   after:before-amount,status:invoice.status,hasFunds:amount<=before};
}
function settle(state,invoiceId,{role,authorized=false,engine,at=new Date().toISOString()}={}){
 const p=preview(state,invoiceId);
 if(role!=="owner")throw Error("Only the Business Owner can confirm a simulated payment.");
 if(!authorized)throw Error("Separate demo PIN verification is required before payment confirmation.");
 if(p.status!=="approved")throw Error("Invoice requires final owner approval before simulated payment.");
 if(!p.hasFunds)throw Error("Insufficient demo cash: invoice amount exceeds available balance.");
 if(!engine||typeof engine.policy!=="function")throw Error("Payment policy engine unavailable.");
 const invoice=state.invoices.find(i=>Number(i.id)===Number(invoiceId));
 const policy=engine.policy({action:"release_payment",role,source:"app",invoice,state});
 if(policy.decision!=="review")throw Error(policy.reason||"Payment policy blocked the simulation.");
 const entry={time:String(at),type:"SIMULATED PAYMENT",invoiceId:p.id,reference:p.ref,
   amount:p.amount,balanceBefore:p.before,balanceAfter:p.after,role:"owner",
   message:p.ref+" · "+p.supplier+" · Payment "+p.amount.toFixed(0)+" BDT; balance "+p.before.toFixed(0)+" → "+p.after.toFixed(0)+" BDT. Owner confirmed local demo only; no bank transfer."};
 const next={...state,balance:p.after,
   invoices:state.invoices.map(i=>Number(i.id)===Number(invoiceId)?{...i,status:"paid",payment:{time:entry.time,amount:p.amount,balanceBefore:p.before,balanceAfter:p.after,by:"owner",simulated:true}}:i),
   audit:[entry,...(state.audit||[])]};
 return {state:next,entry,preview:p};
}
function summary(state){
 if(!state||!Array.isArray(state.invoices))throw Error("Missing demo ledger.");
 const approved=state.invoices.filter(i=>i.status==="approved");
 const paid=state.invoices.filter(i=>i.status==="paid");
 const amount=approved.reduce((s,i)=>s+(number(i.amount)||0),0);
 const latest=(state.audit||[]).find(a=>a.type==="SIMULATED PAYMENT")||null;
 return {balance:number(state.balance),approvedCount:approved.length,approvedAmount:amount,
   paidCount:paid.length,latest,remainingIfAllPaid:number(state.balance)-amount};
}

/* Explain why an invoice is or is not ready to enter owner payment confirmation. */
function eligibility(state,invoiceId,role,engine){
 const p=preview(state,invoiceId);
 const base={...p,allowed:false,shortfall:Math.max(0,p.amount-p.before)};
 if(p.status!=="approved")return {...base,code:"approval",label:"Invoice approval required",detail:"Approve this invoice in Invoice Intelligence before payment authorization."};
 if(!p.hasFunds)return {...base,code:"cash",label:"Payment blocked — insufficient funds",detail:"This invoice exceeds the available demo balance by "+Math.max(0,p.amount-p.before).toFixed(0)+" BDT. No cash has been deducted."};
 if(role!=="owner")return {...base,code:"role",label:"Owner authorization required",detail:"Finance Staff can review an approved invoice but cannot authorize a simulated payment."};
 if(!engine||typeof engine.policy!=="function")throw Error("Policy engine unavailable.");
 const invoice=state.invoices.find(i=>Number(i.id)===Number(invoiceId));
 const result=engine.policy({action:"release_payment",role,source:"app",invoice,state});
 if(result.decision!=="review")return {...base,code:"risk",label:"Payment on hold",detail:result.reason||"Payment policy needs further review."};
 return {...base,allowed:true,code:"ready",label:"Eligible for owner review",detail:"Invoice is approved and the demo balance covers it. A separate public demo PIN and explicit confirmation remain required."};
}
/* Payment history never mixes successful settlements with rejected payment attempts. */
function history(audit=[]){
 const all=Array.isArray(audit)?audit:[];
 const completed=[],blocked=[];
 for(let index=0;index<all.length;index++){
  const event=all[index];if(!event)continue;
  if(event.type==="SIMULATED PAYMENT")completed.push({index,event});
  else if(event.type==="BLOCKED PAYMENT"||
    (event.type==="DEMO PIN DENIED"&&String(event.message||"").startsWith("Simulated payment")))
   blocked.push({index,event});
 }
 return {completed,blocked,all:all.map((event,index)=>({index,event}))};
}

root.LedgertantPaymentLedger=Object.freeze({preview,settle,summary,eligibility,history});
})(globalThis);
