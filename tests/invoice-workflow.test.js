const test=require("node:test");
const assert=require("node:assert/strict");
require("../assets/engine.js");
require("../assets/decision-core.js");
require("../assets/invoice-workflow.js");
const W=globalThis.LedgertantInvoiceWorkflow,E=globalThis.LedgertantEngine,D=globalThis.LedgertantDecision;
const invoice=(status="pending")=>({id:4,ref:"IT-800",supplier:"Cloudbridge IT",bank:"CHANGED",amount:14900,due:1,status});
const make=(status="pending")=>({balance:425000,weeklyIncome:175000,weeklyOperating:110000,role:"owner",
 suppliers:[{name:"Cloudbridge IT",bank:"ORIGINAL",typical:15000}],invoices:[invoice(status)],audit:[]});
const args=(role="owner",reason="bank",note="Confirmed mismatch")=>({invoiceId:4,role,reason,note,at:"2026-10-19T17:00:00.000Z"});
test("owner rejects changed-bank invoice with reason and immutable original",()=>{
 const state=make(),before=JSON.stringify(state),result=W.reject(state,args());
 assert.equal(JSON.stringify(state),before);assert.equal(result.invoices[0].status,"rejected");
 assert.equal(result.invoices[0].rejection.code,"bank");
 assert.equal(result.invoices[0].rejection.by,"owner");
 assert.match(result.audit[0].message,/Incorrect supplier bank details/);
 assert.equal(result.balance,425000);
});
test("staff cannot finally reject",()=>assert.throws(()=>W.reject(make(),args("staff")),/Only the business owner/));
test("staff can recommend without making the invoice unpayable",()=>{
 const r=W.recommend(make(),args("staff"));
 assert.equal(r.invoices[0].status,"under_review");
 assert.equal(r.invoices[0].rejectionRecommendation.label,"Incorrect supplier bank details");
 assert.equal(r.audit[0].type,"REJECTION RECOMMENDED");
});
test("owner cannot impersonate staff recommendations",()=>assert.throws(()=>W.recommend(make(),args("owner")),/Only finance staff/));
test("other reason requires explanation",()=>assert.throws(()=>W.reject(make(),args("owner","other"," ")),/Explain/));
test("no reason is rejected",()=>assert.throws(()=>W.reject(make(),args("owner","unknown")),/Select/));
test("paid invoice cannot be rejected or recommended",()=>{
 assert.throws(()=>W.reject(make("paid"),args()),/Only an unpaid/);
 assert.throws(()=>W.recommend(make("paid"),args("staff")),/Only an unpaid/);
});
test("rejection is idempotently prevented",()=>{
 const s=W.reject(make(),args());
 assert.throws(()=>W.reject(s,args()),/Only an unpaid/);
 assert.equal(s.audit.length,1);
});
test("rejected invoice never leaves the wallet and is absent from forecast",()=>{
 const s=W.reject(make(),args());
 assert.equal(s.balance,425000);
 assert.equal(E.forecast(s)[0].invoiceOut,0);
 assert.equal(E.policy({action:"release_payment",role:"owner",invoice:s.invoices[0],state:s}).decision,"block");
 assert.equal(E.policy({action:"prepare_payment",role:"staff",invoice:s.invoices[0],state:s}).decision,"block");
});
test("reject remains visible to decision engine as nonpayable",()=>{
 const s=W.reject(make(),args());
 const d=D.assess(s.invoices[0],s,E);
 assert.equal(d.key,"rejected");assert.equal(d.canSimulate,false);assert.equal(d.canVerify,false);
});
test("verified but unpaid invoice may be rejected",()=>assert.equal(W.reject(make("verified"),args()).invoices[0].status,"rejected"));
test("original fraud evidence remains in rejected invoice",()=>{
 const s=W.reject(make(),args());
 assert.equal(E.scoreInvoice(s.invoices[0],s.invoices,s.suppliers).score,55);
});
test("notes are capped and untrusted content is data",()=>{
 const result=W.reject(make(),args("owner","other","<img src=x onerror=alert(1)>".repeat(50)));
 assert.ok(result.invoices[0].rejection.note.length<=500);
});
test("recommending rejection does not deduct cash or remove invoice forecast",()=>{
 const s=W.recommend(make(),args("staff"));
 assert.equal(E.forecast(s)[0].invoiceOut,14900);assert.equal(s.balance,425000);
});

test("unapproved invoice blocked before payment even when low risk",()=>{
 const s=make(),verdict=E.policy({action:"release_payment",role:"owner",invoice:s.invoices[0],state:s});
 assert.equal(verdict.decision,"block");
});
test("owner approves a low-risk invoice without transferring cash",()=>{
 const s=make();s.invoices[0].bank="ORIGINAL";
 const a=W.approve(s,{invoiceId:4,role:"owner",note:"Validated against invoice and records",confirmed:true},E);
 assert.equal(a.invoices[0].status,"approved");assert.equal(a.balance,425000);
 assert.equal(E.policy({action:"release_payment",role:"owner",invoice:a.invoices[0],state:a}).decision,"review");
});
test("flagged invoice requires owner verification before formal approval",()=>{
 const s=make();
 assert.throws(()=>W.approve(s,{invoiceId:4,role:"owner",note:"Looks legitimate",confirmed:true},E),/verification/);
 const v=W.verify(s,{invoiceId:4,role:"owner",note:"Independently called supplier and checked bank",confirmed:true});
 const a=W.approve(v,{invoiceId:4,role:"owner",note:"Confirmed invoice following supplier call",confirmed:true},E);
 assert.equal(a.invoices[0].status,"approved");
 assert.equal(E.policy({action:"release_payment",role:"owner",invoice:a.invoices[0],state:a}).decision,"review");
});
test("staff recommendation cannot approve or pay",()=>{
 const s=make();const a=W.recommendApproval(s,{invoiceId:4,role:"staff",note:"Recommend owner investigate the supplier"});
 assert.equal(a.invoices[0].status,"under_review");
 assert.equal(E.policy({action:"release_payment",role:"staff",invoice:a.invoices[0],state:a}).decision,"block");
 assert.throws(()=>W.approve(a,{invoiceId:4,role:"staff",note:"Approved without owner",confirmed:true},E),/Only the Business Owner/);
});
test("verification request marks under review but remains forecast payable",()=>{
 const s=make();const a=W.requestVerification(s,{invoiceId:4,role:"staff",note:"Check supplier bank details"});
 assert.equal(a.invoices[0].status,"under_review");
 assert.equal(E.forecast(a)[0].invoiceOut,14900);
});
test("approval cannot be repeated and does not silently pay",()=>{
 const s=make();s.invoices[0].bank="ORIGINAL";
 const a=W.approve(s,{invoiceId:4,role:"owner",note:"Documents and supplier matched",confirmed:true},E);
 assert.throws(()=>W.approve(a,{invoiceId:4,role:"owner",note:"Approve twice",confirmed:true},E),/awaiting review/);
 assert.equal(a.invoices[0].status,"approved");
 assert.equal(a.audit[0].type,"INVOICE APPROVED");
});
test("no unverified high-risk approval after legacy verified status",()=>{
 const s=make("verified");
 assert.throws(()=>W.approve(s,{invoiceId:4,role:"owner",note:"Prior demo verified status",confirmed:true},E),/verification/);
});
