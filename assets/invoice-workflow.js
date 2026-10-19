/* Local-only invoice disposition workflow. No identity verification or real banking. */
(function(root){
"use strict";
const REASONS=Object.freeze({
 duplicate:"Duplicate invoice",
 bank:"Incorrect supplier bank details",
 amount:"Incorrect invoice amount",
 other:"Other (explain)"
});
const payable=i=>i&&["pending","under_review","verified","approved"].includes(i.status);
const reviewable=i=>i&&["pending","under_review","verified"].includes(i.status);
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
 if(action==="recommend"&&!reviewable(invoice))throw new Error("This invoice has already been approved.");
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
   target.status="under_review";
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

function record(state,invoiceId,role,type,message,apply){
 if(!state||!Array.isArray(state.invoices))throw new Error("Invoice ledger unavailable.");
 const idx=state.invoices.findIndex(x=>Number(x.id)===Number(invoiceId));
 if(idx<0)throw new Error("Invoice not found.");
 const item=state.invoices[idx];
 if(!reviewable(item))throw new Error("This invoice is not awaiting review.");
 const next={...state,invoices:state.invoices.map((x,i)=>i===idx?{...x}:x),audit:(state.audit||[]).slice()};
 const target=next.invoices[idx];
 apply(target);
 next.audit.unshift({time:new Date().toISOString(),type,message:String(item.ref)+" · "+message});
 return next;
}
function requestVerification(state,{invoiceId,role,note}){
 if(!["owner","staff"].includes(role))throw new Error("Invalid demo role.");
 const explanation=cleanNote(note);
 if(explanation.length<8)throw new Error("Explain what needs verification (at least 8 characters).");
 return record(state,invoiceId,role,"VERIFICATION REQUESTED",role+" requested independent verification: "+explanation,item=>{
   item.status="under_review";item.verificationRequest={note:explanation,by:role,at:new Date().toISOString()};
 });
}
function recommendApproval(state,{invoiceId,role,note}){
 if(role!=="staff")throw new Error("Only Finance Staff can recommend approval.");
 const explanation=cleanNote(note);
 if(explanation.length<8)throw new Error("Provide an approval recommendation reason (at least 8 characters).");
 return record(state,invoiceId,role,"APPROVAL RECOMMENDED",explanation+" · Owner decision required",item=>{
   item.status="under_review";
   item.approvalRecommendation={note:explanation,by:role,at:new Date().toISOString()};
 });
}
function verify(state,{invoiceId,role,note,confirmed}){
 if(role!=="owner")throw new Error("Only the Business Owner can record demo verification.");
 if(confirmed!==true)throw new Error("Confirm independent supplier and payment-detail checks.");
 const explanation=cleanNote(note);
 if(explanation.length<8)throw new Error("Record how the details were checked (at least 8 characters).");
 return record(state,invoiceId,role,"DEMO VERIFICATION",explanation+" · Owner asserted independent verification (not independently validated by Ledgertant)",item=>{
   item.status="under_review";
   item.verification={attested:true,note:explanation,by:"owner",at:new Date().toISOString()};
 });
}
function approve(state,{invoiceId,role,note,confirmed},engine){
 if(role!=="owner")throw new Error("Only the Business Owner can approve invoices.");
 if(confirmed!==true)throw new Error("Confirm invoice and supplier checks before approval.");
 const explanation=cleanNote(note);
 if(explanation.length<8)throw new Error("Provide an approval reason (at least 8 characters).");
 if(!engine||typeof engine.scoreInvoice!=="function")throw new Error("Fraud screening engine unavailable.");
 const invoice=state?.invoices?.find(x=>Number(x.id)===Number(invoiceId));
 if(!reviewable(invoice))throw new Error("Only invoices awaiting review may be approved.");
 const risk=engine.scoreInvoice(invoice,state.invoices,state.suppliers);
 if(risk.level!=="low"&&!invoice.verification?.attested)
   throw new Error("Risk alerts require a recorded owner verification before approval.");
 return record(state,invoiceId,role,"INVOICE APPROVED",explanation+" · Risk "+risk.score+"/100 · Owner approval, not payment",item=>{
   item.status="approved";
   item.approval={by:"owner",note:explanation,riskScore:risk.score,at:new Date().toISOString()};
   delete item.rejectionRecommendation;
 });
}
root.LedgertantInvoiceWorkflow=Object.freeze({
 REASONS,payable,reviewable,reject,recommend,requestVerification,recommendApproval,verify,approve
});
})(globalThis);
