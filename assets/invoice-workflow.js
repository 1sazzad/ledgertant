/* Local-only invoice disposition workflow. No identity verification or real banking. */
(function(root){
"use strict";
const REASONS=Object.freeze({
 duplicate:"Duplicate invoice",
 bank:"Incorrect supplier bank details",
 amount:"Incorrect invoice amount",
 other:"Other (explain)"
});
const payable=i=>i&&["pending","verified"].includes(i.status);
const cleanNote=value=>String(value||"").trim().slice(0,500);
function validate(state,id,role,reason,note,action){
 if(!state||!Array.isArray(state.invoices))throw new Error("Invoice ledger unavailable.");
 if(role!=="owner"&&role!=="staff")throw new Error("Unknown demonstration role.");
 if(action==="reject"&&role!=="owner")throw new Error("Only the business owner can reject an invoice.");
 if(action==="recommend"&&role!=="staff")throw new Error("Only finance staff can recommend rejection.");
 const index=state.invoices.findIndex(i=>Number(i.id)===Number(id));
 if(index===-1)throw new Error("Invoice not found.");
 const invoice=state.invoices[index];
 if(!payable(invoice))throw new Error("Only an unpaid invoice can be reviewed for rejection.");
 if(!Object.prototype.hasOwnProperty.call(REASONS,reason))throw new Error("Select a rejection reason.");
 const trimmed=cleanNote(note);
 if(reason==="other"&&!trimmed)throw new Error("Explain the other reason before continuing.");
 return {index,invoice,trimmed};
}
function operate(state,{invoiceId,role,reason,note="",at=new Date().toISOString()},action){
 const {index,invoice,trimmed}=validate(state,invoiceId,role,reason,note,action);
 const timestamp=String(at);
 const reasonRecord={code:reason,label:REASONS[reason],note:trimmed,at:timestamp,by:role};
 const output={
   ...state,invoices:state.invoices.map((i,n)=>n===index?{...i}:i),
   audit:Array.isArray(state.audit)?state.audit.map(x=>({...x})):[]
 };
 const target=output.invoices[index];
 if(action==="reject"){
   target.status="rejected";
   target.rejection=reasonRecord;
   delete target.rejectionRecommendation;
 }else{
   target.rejectionRecommendation=reasonRecord;
 }
 const message=invoice.ref+" · "+REASONS[reason]+(trimmed?" ("+trimmed+")":"");
 output.audit.unshift({
   time:timestamp,
   type:action==="reject"?"INVOICE REJECTED":"REJECTION RECOMMENDED",
   message:message+(action==="reject"?" · Owner decision; no payment or cash deduction.":" · Finance staff request; owner review required.")
 });
 return output;
}
function reject(state,args){return operate(state,args,"reject")}
function recommend(state,args){return operate(state,args,"recommend")}
root.LedgertantInvoiceWorkflow=Object.freeze({REASONS,payable,reject,recommend});
})(globalThis);
