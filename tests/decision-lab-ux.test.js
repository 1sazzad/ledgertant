const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../assets/engine.js");require("../assets/decision-core.js");require("../assets/decision-lab-core.js");require("../assets/decision-lab-ux.js");
const E=globalThis.LedgertantEngine,D=globalThis.LedgertantDecision,L=globalThis.LedgertantDecisionLabCore,U=globalThis.LedgertantDecisionLabUX;
const data=()=>({balance:200000,weeklyIncome:50000,weeklyOperating:30000,role:"owner",suppliers:[{name:"A",bank:"safe",typical:12000}],invoices:[{id:1,ref:"A-1",supplier:"A",bank:"safe",amount:60000,due:2,status:"approved"}]});
const result=(mode="base",buffer=100000)=>L.evaluate(data(),1,E,D,{mode,buffer});
test("due baseline has zero deltas and no fake difference",()=>{
 const x=U.compare(result(),"due");
 assert.deepEqual(x.delta,{startingCash:0,lowestCash:0,closingCash:0});
 assert.equal(x.hasChange,false);
 assert.equal(x.referenceLabel,"Pay on scheduled week");
});
test("pay-now feedback describes immediate cash decrease without modifying ledger",()=>{
 const d=data(),r=L.evaluate(d,1,E,D),x=U.compare(r,"now");
 assert.equal(x.delta.startingCash,-60000);
 assert.equal(d.balance,200000);
 assert.match(x.timingLabel,/before next week/i);
});
test("deferred option clearly exposes due week and supplier dependency",()=>{
 const x=U.compare(result(),"defer");
 assert.equal(x.selected.dueWeek,4);
 assert.match(x.timingLabel,/week 4/);
 assert.match(x.note,/supplier agreement/i);
});
test("future liability outside chart is disclosed",()=>{
 const s=data();s.invoices[0].due=8;
 const out=L.evaluate(s,1,E,D);
 const x=U.compare(out,"defer");
 assert.equal(x.selected.beyondHorizon,true);
 assert.match(x.timingLabel,/beyond the 8-week forecast/);
});
test("stress sales mode and reserve classification are explicit",()=>{
 const x=U.compare(result("stress",300000),"now");
 assert.equal(x.modeLabel,"Sales down 35%");
 assert.equal(x.reserve,300000);
 assert.equal(x.belowReserve,x.selected.lowestCash<300000);
 assert.equal(x.reserveDistance,x.selected.lowestCash-300000);
});
test("invalid option defaults to schedule baseline",()=>{
 const x=U.compare(result(),"wrong");
 assert.equal(x.selected.id,"due");
});
test("comparison never mutates original model output",()=>{
 const r=result(),before=JSON.stringify(r);
 U.compare(r,"now");
 assert.equal(JSON.stringify(r),before);
});
const fs=require("node:fs");const html=fs.readFileSync(require("node:path").join(__dirname,"../index.html"),"utf8");
test("Decision Lab feedback and chart landmarks present",()=>{
 for(const v of ["labLiveSummary","labChoiceComparison","labResultDetail","data-lab-case","decision-lab-ux.js"])
 assert.ok(html.includes(v),"Missing "+v);
});
