const assert=require("node:assert/strict");
const {test}=require("node:test");
require("../assets/demo-pin-core.js");
const PIN=globalThis.LedgertantDemoPIN;
const item=(status="approved")=>({ref:"MP-1077",status});
test("Finance Staff owner switch requires exact demo PIN",()=>{
 assert.equal(PIN.validate({action:"role_switch",role:"staff",pin:"1234"}).ok,true);
 for(const pin of ["0000","123","12345","12a4","",null,1234])
  assert.equal(PIN.validate({action:"role_switch",role:"staff",pin}).ok,false);
});
test("only owner on approved invoice may authorize demo payment",()=>{
 assert.equal(PIN.validate({action:"payment",role:"owner",invoice:item(),pin:"1234"}).ok,true);
 assert.equal(PIN.validate({action:"payment",role:"staff",invoice:item(),pin:"1234"}).code,"role");
 assert.equal(PIN.validate({action:"payment",role:"owner",invoice:item("pending"),pin:"1234"}).code,"invoice");
 assert.equal(PIN.validate({action:"payment",role:"owner",invoice:item("rejected"),pin:"1234"}).code,"invoice");
 assert.equal(PIN.validate({action:"payment",role:"owner",invoice:item("paid"),pin:"1234"}).code,"invoice");
});
test("unknown PIN action is always denied",()=>{
 assert.equal(PIN.validate({action:"bypass_payment",role:"owner",pin:"1234"}).ok,false);
 assert.throws(()=>PIN.audit({action:"bypass_payment"}),/Unknown/);
});
test("audit entries include outcome, action and invoice but never include entered PIN",()=>{
 for(const action of ["role_switch","payment"])for(const ok of [true,false]){
 const a=PIN.audit({action,role:"owner",invoice:item(),ok,time:"2026-10-20T01:00:00.000Z"});
 assert.equal(a.type,ok?"DEMO PIN ACCEPTED":"DEMO PIN DENIED");
 assert.ok(a.message.includes(action==="payment"?"MP-1077":"Business Owner"));
 assert.equal(a.time,"2026-10-20T01:00:00.000Z");
 assert.ok(!a.message.includes("1234"));
 }
});
test("authorization never mutates invoice and cannot make bank transfer",()=>{
 const invoice=item(),before=JSON.stringify(invoice);
 PIN.validate({action:"payment",role:"owner",invoice,pin:"1234"});
 assert.equal(JSON.stringify(invoice),before);
 assert.equal(typeof PIN.executePayment,"undefined");
});
const fs=require("node:fs"),path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
test("UI has a dedicated PIN form and masked input for both flows",()=>{
 for(const needle of ["demoPinRoot","demoPinForm","type=\"password\"","inputmode=\"numeric\"","Demo PIN:","LedgertantDemoPIN.validate"])
  assert.ok(html.includes(needle),"Missing "+needle);
});
test("PIN cannot appear in logged audit messages",()=>{
 const a=PIN.audit({action:"payment",role:"owner",invoice:item(),ok:false});
 assert.doesNotMatch(a.message,/\b1234\b/);
});
