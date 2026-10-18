/* node --test tests/journey.test.js; standalone built-in test runner */
const assert=require("node:assert/strict");
const {test}=require("node:test");
require("../assets/engine.js");
require("../assets/journey-core.js");
const E=globalThis.LedgertantEngine,J=globalThis.LedgertantJourney;
const base=()=>({balance:425000,weeklyIncome:175000,weeklyOperating:110000,role:"staff",suppliers:[{name:"Bright Supply Co",bank:"BD18",typical:42000}],invoices:[{id:1,ref:"BS-2401",supplier:"Bright Supply Co",amount:42500,bank:"BD18",due:1,status:"pending"},{id:2,ref:"BS-2401",supplier:"Bright Supply Co",amount:42500,bank:"BD18",due:2,status:"pending"}],audit:[{type:"TEST"}]});
test("all 3 story fixtures exist",()=>assert.deepEqual(Object.keys(J.scenarios),["fraud","squeeze","healthy"]));
test("7 tour steps point to known sections",()=>assert.deepEqual(J.steps.map(x=>x.key),["overview","invoices","cashflow","financing","security","payments","audit"]));
test("fraud story resets local audit and restores owner role",()=>{const s=J.makeScenario(base(),"fraud");assert.equal(s.audit.length,0);assert.equal(s.role,"owner")});
test("stress scenario models limited funds",()=>{const s=J.makeScenario(base(),"squeeze");assert.equal(s.balance,140000);assert.equal(s.weeklyIncome,76000)});
test("healthy scenario removes flagged test invoices from fixture when available",()=>{const s=J.makeScenario(base(),"healthy");assert.equal(s.balance,720000);assert.equal(s.invoices.length,2)});
test("scenario selection never mutates original",()=>{const b=base();J.makeScenario(b,"squeeze");assert.equal(b.balance,425000);assert.equal(b.audit.length,1)});
test("duplicate exposure counts only excess copies",()=>{const a=J.impact(base(),E);assert.equal(a.duplicateCount,1);assert.equal(a.duplicateExposure,42500)});
test("flagged exposure is expressly not savings",()=>{const a=J.impact(base(),E);assert.equal(a.flaggedExposure,85000);assert.ok(!("savings" in a))});
test("reported cash numbers agree with engine",()=>{const b=base(),a=J.impact(b,E);assert.equal(a.weeklyLow,Math.min(...E.forecast(b,"base").map(x=>x.balance)))});
test("report labels limitations transparently",()=>{const report=J.report(base(),E,"fraud");assert.match(report,/NOT measured savings/);assert.match(report,/no real transfers|No real transfers/i)});
test("unknown scenario is rejected",()=>assert.throws(()=>J.makeScenario(base(),"unknown")));
