/* Ledgertant deterministic offline decision engine (demo-only; no banking integrations). */
(function(root){
"use strict";
const number=x=>Number.isFinite(Number(x))?Number(x):0;
function scoreInvoice(invoice,invoices=[],suppliers=[]){
  const signals=[];const supplier=suppliers.find(s=>String(s.name).toLowerCase()===String(invoice.supplier).toLowerCase());
  if(!supplier)signals.push({code:"UNRECOGNIZED_SUPPLIER",label:"Supplier has not been verified",points:35});
  else{
    if(String(invoice.bank)!==String(supplier.bank))signals.push({code:"BANK_CHANGED",label:"Payment bank differs from supplier master",points:55});
    if(number(invoice.amount)>number(supplier.typical)*2)signals.push({code:"AMOUNT_ANOMALY",label:"Invoice is more than 2× typical supplier amount",points:32});
  }
  if(invoices.some(i=>i.id!==invoice.id&&String(i.ref).toLowerCase()===String(invoice.ref).toLowerCase()&&String(i.supplier).toLowerCase()===String(invoice.supplier).toLowerCase()))signals.push({code:"DUPLICATE_REFERENCE",label:"Another invoice uses this supplier + reference",points:65});
  if(number(invoice.amount)>=200000)signals.push({code:"HIGH_VALUE",label:"High-value invoice needs extra attention",points:10});
  const rawScore=signals.reduce((sum,s)=>sum+s.points,0);const score=Math.min(100,rawScore);
  return {score,rawScore,level:score>=60?"high":score>=30?"medium":"low",signals,reasons:signals.length?signals.map(s=>s.label):["No configured rule violations detected"]};
}
function forecast(state,mode="base"){
  const factor=mode==="stress"?0.65:mode==="growth"?1.2:1;
  let balance=number(state.balance);
  return Array.from({length:8},(_,ix)=>{
    const week=ix+1;
    const invoiceOut=(state.invoices||[]).filter(i=>["pending","under_review","verified","approved"].includes(i.status)&&number(i.due)===week).reduce((a,i)=>a+number(i.amount),0);
    balance+=number(state.weeklyIncome)*factor-number(state.weeklyOperating)-invoiceOut;
    return {week,balance,invoiceOut};
  });
}
function detectInjection(text){
  const value=String(text||"");
  const patterns=[
    {code:"OVERRIDE_INSTRUCTIONS",re:/ignore (all |any |the )?(previous|prior|earlier) (instructions|rules)|override (all |the )?(rules|policy|safeguards)/i},
    {code:"ROLE_SPOOFING",re:/\b(system|developer|administrator)\s*(prompt|message|instructions|override)\b|\byou are now (the )?(system|admin)/i},
    {code:"EXFILTRATION_OR_PAYMENT_REDIRECT",re:/\b(send|transfer|wire) (all )?(funds|money|balance) to\b|\bskip (the )?(approval|verification|review)\b/i}
  ];
  return patterns.filter(p=>p.re.test(value)).map(p=>p.code);
}
function policy({action="read",role="staff",source="app",invoice=null,state={},text=""}={}){
  const r=invoice?scoreInvoice(invoice,state.invoices||[],state.suppliers||[]):null;
  const injections=detectInjection(text);
  const respond=(decision,autonomy,reason)=>({decision,autonomy,reason,invoiceRisk:r?.score??null,signals:injections});
  if(injections.length)return respond("block","blocked","Potential instruction-injection pattern in untrusted content. Treat it only as data; do not execute instructions.");
  if(source!=="app"&&action!=="read")return respond("block","blocked","Untrusted invoice or supplier content cannot authorize financial operations.");
  if(action==="change_bank")return respond("block","blocked","Changing a supplier bank account requires independent out-of-band verification; this demo never edits it.");
  if(action==="read")return respond("allow","read-only","Read-only analysis is allowed. External content is data, not authority.");
  if(!invoice)return respond("block","blocked","Choose an invoice for this operation.");
  if(action==="prepare_payment"){
    if(!["pending","under_review","verified","approved"].includes(invoice.status))return respond("block","blocked","Invoice is not eligible for payment preparation.");
    if(r.level!=="low"&&!invoice.verification?.attested)return respond("block","blocked","Flagged invoice requires recorded verification before a payment can be prepared.");
    return respond("review","draft-only","Payment may be prepared as a draft, but a human owner must approve release.");
  }
  if(action==="release_payment"){
    if(role!=="owner")return respond("block","blocked","Only an owner can approve a simulated payment.");
    if(invoice.status!=="approved")return respond("block","blocked","Invoice needs formal owner approval in Invoice Intelligence before payment.");
    if(r.level!=="low"&&!invoice.verification?.attested)return respond("block","blocked","Suspicious invoice requires recorded owner verification before payment.");
    if(number(invoice.amount)>number(state.balance))return respond("block","blocked","Insufficient available demo cash.");
    return respond("review","human-approval","Eligible for a manual owner confirmation; policy never executes a payment automatically.");
  }
  return respond("block","blocked","Unknown requested operation.");
}
root.LedgertantEngine=Object.freeze({scoreInvoice,forecast,detectInjection,policy});
})(globalThis);
