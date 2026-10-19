const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../assets/invoice-queue-core.js");
require("../assets/invoice-workflow.js");
require("../assets/engine.js");
const Q=globalThis.LedgertantInvoiceQueue,W=globalThis.LedgertantInvoiceWorkflow,E=globalThis.LedgertantEngine;
const sample=(status="pending")=>({balance:50000,weeklyIncome:20000,weeklyOperating:5000,role:"owner",audit:[],
 suppliers:[{name:"Acme",bank:"SAFE",typical:12000}],invoices:[{id:1,ref:"A-1",supplier:"Acme",bank:"SAFE",amount:9000,due:1,status}]});
const args=(role="owner")=>({invoiceId:1,role,note:"Independently confirmed supplier and invoice",confirmed:true});
test("tabs represent one current status each including legacy verified",()=>{
 const list=["pending","under_review","verified","approved","rejected","paid"].map((status,id)=>({id,status}));
 assert.deepEqual(Q.counts(list),{all:6,pending:1,under_review:2,approved:1,rejected:1,paid:1});
 assert.equal(Q.filtered(list,"under_review").length,2);
 assert.deepEqual(Q.filtered(list,"rejected").map(x=>x.status),["rejected"]);
 assert.deepEqual(Q.filtered(list,"bogus"),[]);
});
test("status lists are non-mutating and stable",()=>{
 const items=sample().invoices;
 const a=Q.filtered(items,"all");assert.notEqual(a,items);
 assert.deepEqual(a,items);assert.equal(items[0].status,"pending");
});
test("each completed operation picks the correct destination tab",()=>{
 for(const [a,t] of Object.entries({create:"pending",approve:"approved",reject:"rejected",verify:"under_review",request:"under_review",recommend:"under_review",recommend_reject:"under_review",pay:"paid"}))
 assert.equal(Q.nextTab(a),t);
});
test("context actions vary by status and role",()=>{
 assert.deepEqual(Q.actions("pending","owner"),["review","approve","verify","reject"]);
 assert.deepEqual(Q.actions("under_review","staff"),["review","recommend","request","recommend_reject"]);
 assert.deepEqual(Q.actions("approved","owner"),["review","payment","reject"]);
 assert.deepEqual(Q.actions("approved","staff"),["review","payment"]);
 assert.deepEqual(Q.actions("rejected","owner"),["review"]);
 assert.deepEqual(Q.actions("paid","staff"),["review"]);
});
test("staff rejection recommendation moves item to Under Review and preserves cash",()=>{
 const original=sample(),result=W.recommend(original,{invoiceId:1,role:"staff",reason:"bank",note:"Mismatch reported"});
 assert.equal(result.invoices[0].status,"under_review");
 assert.equal(Q.counts(result.invoices).under_review,1);
 assert.equal(Q.counts(result.invoices).pending,0);
 assert.equal(result.balance,original.balance);
});
test("owner approval moves Pending to Approved but is not payment",()=>{
 const original=sample(),result=W.approve(original,args(),E);
 assert.equal(Q.counts(result.invoices).approved,1);
 assert.equal(Q.counts(result.invoices).pending,0);
 assert.equal(result.balance,original.balance);
 assert.equal(result.audit[0].type,"INVOICE APPROVED");
});
test("owner rejection moves Under Review to Rejected and removes outflow",()=>{
 const original=W.requestVerification(sample(),{invoiceId:1,role:"staff",note:"Check the invoice"});
 const result=W.reject(original,{invoiceId:1,role:"owner",reason:"duplicate",note:"Duplicate number"});
 assert.equal(Q.counts(result.invoices).under_review,0);
 assert.equal(Q.counts(result.invoices).rejected,1);
 assert.equal(E.forecast(result)[0].invoiceOut,0);
});
test("paid invoices move to Paid while leaving other counts unchanged",()=>{
 const items=[{id:1,status:"approved"},{id:2,status:"pending"}];
 const before=Q.counts(items);
 items[0].status="paid";
 const after=Q.counts(items);
 assert.equal(before.approved,1);assert.equal(after.paid,1);
 assert.equal(after.pending,1);
});
