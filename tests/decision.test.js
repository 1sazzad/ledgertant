/* Run: node --test tests/decision.test.js */
const assert=require("node:assert/strict");
const {test}=require("node:test");
require("../assets/engine.js");
require("../assets/decision-core.js");
const E=globalThis.LedgertantEngine,D=globalThis.LedgertantDecision;
const supplier={name:"Acme",bank:"AC-1",typical:12000};
const good={id:1,ref:"AC-100",supplier:"Acme",bank:"AC-1",amount:10000,due:2,status:"pending"};
const bad={id:2,ref:"AC-101",supplier:"Acme",bank:"REDIRECT",amount:10000,due:1,status:"pending"};
const state=(role="owner",cash=100000)=>({balance:cash,weeklyIncome:30000,weeklyOperating:10000,suppliers:[supplier],invoices:[{...good},{...bad}],role,audit:[]});
test("unverified changed-bank invoice is HOLD",()=>assert.equal(D.assess(bad,state(),E).key,"verify"));
test("a flagged invoice is not silently verified by staff",()=>assert.equal(D.assess(bad,state("staff"),E).canVerify,false));
test("verified flag does not erase warning",()=>{const x={...bad,status:"verified"},s=state();s.invoices[1]=x;const a=D.assess(x,s,E);assert.equal(a.riskLevel,"medium");assert.equal(a.canSimulate,true)});
test("insufficient funds blocks simulation",()=>assert.equal(D.assess(good,state("owner",100),E).key,"cash"));
test("staff must request owner action",()=>assert.equal(D.assess(good,state("staff"),E).key,"owner"));
test("eligible owner sees advisory, not unconditional pay order",()=>{const a=D.assess(good,state(),E);assert.equal(a.key,"ready");assert.match(a.summary,/owner|buffer/i)});
test("paid invoice has no further action",()=>assert.equal(D.assess({...good,status:"paid"},state(),E).canSimulate,false));
test("verified unpaid invoice remains forecast outflow",()=>{const s=state();s.invoices[0].status="verified";assert.equal(E.forecast(s)[1].invoiceOut,10000)});
test("assessment never edits its inputs",()=>{const s=state(),before=JSON.stringify(s);D.assess(bad,s,E);assert.equal(JSON.stringify(s),before)});
