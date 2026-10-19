/* Presentation-only insights for Decision Lab. All calculations remain in decision-lab-core.js. */
(function(root){
"use strict";
const num=v=>Number.isFinite(Number(v))?Number(v):0;
function compare(result,id){
 if(!result||!Array.isArray(result.cases))throw new Error("Decision Lab results missing.");
 const baseline=result.cases.find(c=>c.id==="due");
 const selected=result.cases.find(c=>c.id===id)||baseline;
 if(!baseline||!selected)throw new Error("Decision Lab timing options missing.");
 const delta={startingCash:num(selected.startingCash)-num(baseline.startingCash),
  lowestCash:num(selected.lowestCash)-num(baseline.lowestCash),
  closingCash:num(selected.closingCash)-num(baseline.closingCash)};
 const reserve=num(result.buffer),min=num(selected.lowestCash);
 return {
  selected,baseline,delta,reserve,
  belowReserve:min<reserve,
  reserveDistance:min-reserve,
  referenceLabel:"Pay on scheduled week",
  modeLabel:{base:"Expected sales",stress:"Sales down 35%",growth:"Sales up 20%"}[result.mode]||"Expected sales",
  timingLabel:selected.id==="now"?"Invoice would be paid before next week's revenue":selected.id==="defer"?
  (selected.beyondHorizon?"Invoice outflow would move beyond the 8-week forecast":"Invoice outflow would move to week "+selected.dueWeek):
  "Invoice remains due in week "+selected.dueWeek,
  hasChange:delta.startingCash!==0||delta.lowestCash!==0||delta.closingCash!==0||selected.dueWeek!==baseline.dueWeek,
  note:selected.id==="defer"?"Extension is hypothetical and requires supplier agreement. The liability is not cancelled.":
    selected.id==="now"?"Immediate payment is hypothetical and requires separate owner approval.":"This is the scheduled-payment baseline."
 };
}
root.LedgertantDecisionLabUX=Object.freeze({compare});
})(globalThis);
