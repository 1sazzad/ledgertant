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
 assert.equal(r.invoices[0].status,"pending");
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
