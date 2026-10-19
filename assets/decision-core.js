/* Explainable payment decision assistance. Synthetic, local-only; NOT authorization. */
(function(root){
"use strict";
const amount=n=>Number.isFinite(Number(n))?Number(n):0;
const minimum=a=>Math.min(...a.map(x=>x.balance));
function assess(invoice,state,engine){
  if(!invoice||!state||!engine)throw new Error("Decision input missing");
  const risk=engine.scoreInvoice(invoice,state.invoices||[],state.suppliers||[]);
  const unpaid=["pending","verified"].includes(invoice.status);
  const isFlagged=risk.level!=="low";
  const verified=invoice.status==="verified";
  const balance=amount(state.balance),value=amount(invoice.amount);
  const baseFloor=minimum(engine.forecast(state,"base"));
  const stressFloor=minimum(engine.forecast(state,"stress"));
  const cashAfter=balance-value;
  const signals=risk.reasons;
  let key,label,summary,next;
  if(invoice.status==="rejected"){
    key="rejected";label="REJECTED — NOT PAYABLE";
    summary="The owner rejected this invoice. It is excluded from future payments and the cash forecast.";
    next="Inspect the recorded reason in Invoice intelligence and the Decision ledger.";
  }else if(invoice.status==="paid"){
    key="completed";label="Simulated payment completed";
    summary="This invoice was marked paid in the local demo. No bank transfer occurred.";
    next="Inspect its recorded local activity in the decision ledger.";
  }else if(!unpaid){
    key="unavailable";label="Payment unavailable";
    summary="This invoice is not in a payable demo state.";next="Review the invoice status.";
  }else if(isFlagged&&!verified){
    key="verify";label="HOLD — do not pay yet";
    summary="Risk signals are unresolved. A business owner must perform independent supplier checks before any simulation can proceed.";
    next="Review the risk evidence, independently confirm invoice and payment details, then record a demo-only verification.";
  }else if(value>balance){
    key="cash";label="HOLD — not enough cash";
    summary="The invoice exceeds the current simulated available balance.";
    next="Adjust the cash plan or wait for funds before considering payment.";
  }else if(state.role!=="owner"){
    key="owner";label="OWNER APPROVAL REQUIRED";
    summary="Finance staff can review an invoice but cannot release a simulated payment.";
    next="Ask an owner to inspect and explicitly confirm the simulation.";
  }else{
    key="ready";label="Eligible for owner simulation";
    summary=baseFloor<100000?"The technical checks pass, but the base-case cash floor is below the illustrative ৳100,000 buffer.":"The technical checks pass; the owner must still decide whether and when to pay.";
    next="Examine cash projections, confirm the payment timing, then explicitly approve the demo-only ledger update.";
  }
  return {
    key,label,summary,next,signals,riskScore:risk.score,riskLevel:risk.level,
    flagged:isFlagged,verified,amount:value,balance,cashAfter,
    baseFloor,stressFloor,canVerify:unpaid&&isFlagged&&!verified&&state.role==="owner",
    canSimulate:key==="ready",buffer:100000,dueWeek:invoice.due,
    role:state.role,
    steps:[
      {name:"Supplier and invoice",ok:!isFlagged||verified,detail:isFlagged?(verified?"Demo verification recorded; underlying warning still visible.":"Warning signals need investigation."): "No configured risk rule triggered."},
      {name:"Available funds",ok:value<=balance,detail:"Current demo cash after payment: "+cashAfter.toFixed(0)+" BDT."},
      {name:"Owner authorization",ok:state.role==="owner",detail:state.role==="owner"?"Owner simulation mode enabled.":"Staff may not release payments."},
      {name:"Human confirmation",ok:key==="completed",detail:key==="completed"?"Local payment marked as simulated.":"No payment is executed automatically."}
    ]
  };
}
root.LedgertantDecision=Object.freeze({assess});
})(globalThis);
