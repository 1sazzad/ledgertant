const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
require("../assets/engine.js");
require("../assets/payment-ledger-core.js");
const E=globalThis.LedgertantEngine,L=globalThis.LedgertantPaymentLedger;
const sample=(balance=425000,status="approved")=>({
 balance,role:"owner",weeklyIncome:175000,weeklyOperating:110000,
 suppliers:[{name:"Metro Packaging",bank:"BD32",typical:55000}],
 invoices:[{id:2,ref:"MP-1077",supplier:"Metro Packaging",bank:"BD32",amount:55200,due:2,status}],
 audit:[]
});
test("preview reports before/after balance without changing ledger",()=>{
 const s=sample();const old=JSON.stringify(s),p=L.preview(s,2);
 assert.deepEqual([p.before,p.amount,p.after,p.hasFunds],[425000,55200,369800,true]);
 assert.equal(JSON.stringify(s),old);
});
test("successful owner simulation moves approved invoice to paid and records amounts",()=>{
 const original=sample(),result=L.settle(original,2,{role:"owner",authorized:true,engine:E,at:"2026-10-20T00:00:00.000Z"});
 assert.equal(original.balance,425000);
 assert.equal(original.invoices[0].status,"approved");
 assert.equal(result.state.balance,369800);
 assert.equal(result.state.invoices[0].status,"paid");
 assert.deepEqual([result.entry.amount,result.entry.balanceBefore,result.entry.balanceAfter],[55200,425000,369800]);
 assert.equal(result.entry.time,"2026-10-20T00:00:00.000Z");
 assert.match(result.entry.message,/no bank transfer/i);
});
test("paid invoice cannot be paid twice",()=>{
 const s=L.settle(sample(),2,{role:"owner",authorized:true,engine:E}).state;
 assert.throws(()=>L.settle(s,2,{role:"owner",authorized:true,engine:E}),/approval/);
});
test("staff or skipped PIN cannot simulate a payment",()=>{
 const s=sample();
 assert.throws(()=>L.settle(s,2,{role:"staff",authorized:true,engine:E}),/Business Owner/);
 assert.throws(()=>L.settle(s,2,{role:"owner",authorized:false,engine:E}),/PIN/);
 assert.equal(s.balance,425000);
});
test("insufficient cash blocks transaction with no deductions, even when approved",()=>{
 const s=sample(10000),before=JSON.stringify(s);
 assert.equal(L.preview(s,2).after,-45200);
 assert.equal(L.preview(s,2).hasFunds,false);
 assert.throws(()=>L.settle(s,2,{role:"owner",authorized:true,engine:E}),/Insufficient/);
 assert.equal(JSON.stringify(s),before);
});
test("a pending or rejected invoice cannot be paid",()=>{
 for(const status of ["pending","rejected","under_review","paid"]){
  assert.throws(()=>L.settle(sample(425000,status),2,{role:"owner",authorized:true,engine:E}),/approval/);
 }
});
test("rechecked policy still blocks risky bank mismatch even with local authorization",()=>{
 const s=sample();s.invoices[0].bank="ATTACKER";
 assert.throws(()=>L.settle(s,2,{role:"owner",authorized:true,engine:E}),/verification/);
});
test("payment summary includes pending approved cash and latest payment",()=>{
 const s=sample(),p=L.summary(s);
 assert.equal(p.approvedAmount,55200);assert.equal(p.approvedCount,1);
 assert.equal(p.paidCount,0);assert.equal(p.remainingIfAllPaid,369800);
 const done=L.settle(s,2,{role:"owner",authorized:true,engine:E}).state;
 const after=L.summary(done);
 assert.equal(after.approvedCount,0);assert.equal(after.paidCount,1);
 assert.equal(after.balance,369800);
 assert.equal(after.latest.balanceAfter,369800);
});
test("all payment summary and confirm surfaces are wired into page",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
 for(const term of ["paymentBalanceDashboard","paymentConfirmRoot","paymentConfirmDialog","data-confirm-payment","data-cancel-payment","LedgertantPaymentLedger.settle","Payment history"])
  assert.ok(html.includes(term),"Missing "+term);
});

test("eligibility reports actual insufficient-cash shortfall without moving money",()=>{
 const s=sample(10000),before=JSON.stringify(s);
 const result=L.eligibility(s,2,"owner",E);
 assert.equal(result.code,"cash");
 assert.equal(result.shortfall,45200);
 assert.equal(result.allowed,false);
 assert.match(result.detail,/No cash has been deducted/);
 assert.equal(JSON.stringify(s),before);
});
test("history separates success from payment blocks and preserves full activity",()=>{
 const entries=[
 {type:"BLOCKED PAYMENT",message:"MP-1077 · Insufficient funds"},
 {type:"SIMULATED PAYMENT",message:"MP-1077 settled",amount:55200},
 {type:"DEMO PIN DENIED",message:"Simulated payment MP-1077 · Demo PIN was incorrect."},
 {type:"ROLE CHANGE",message:"Finance Staff selected"}
 ];
 const h=L.history(entries);
 assert.deepEqual(h.completed.map(x=>x.index),[1]);
 assert.deepEqual(h.blocked.map(x=>x.index),[0,2]);
 assert.equal(h.all.length,4);
 assert.equal(h.completed[0].event.type,"SIMULATED PAYMENT");
});
test("payment blocking and audit filters are visible in application source",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
 for(const key of ["payment-warning","data-audit-tab","Successful payments","Blocked attempts","Shortfall:","paymentBalanceDashboard"])
  assert.ok(html.includes(key),"Missing "+key);
});
