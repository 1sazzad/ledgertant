const {test}=require("node:test");
const assert=require("node:assert/strict");
require("../assets/security-settings-core.js");require("../assets/demo-pin-core.js");
const S=globalThis.LedgertantSecuritySettings,P=globalThis.LedgertantDemoPIN;
const sample=()=>({role:"owner",audit:[],securitySettings:S.normalize()});
test("only owner and verified PIN may save security preferences",()=>{
 const draft={securityAlerts:false,reviewReminders:true,extraReviewThreshold:50};
 assert.throws(()=>S.save(sample(),draft,{role:"staff",authorized:true}),/Business Owner/);
 assert.throws(()=>S.save(sample(),draft,{role:"owner",authorized:false}),/PIN/);
 assert.equal(P.validate({action:"security_settings",role:"staff",pin:"1234"}).ok,false);
 assert.equal(P.validate({action:"security_settings",role:"owner",pin:"0000"}).ok,false);
 assert.equal(P.validate({action:"security_settings",role:"owner",pin:"1234"}).ok,true);
});
test("changes persist in returned state and never edit original input",()=>{
 const st=sample(),newPrefs={securityAlerts:false,reviewReminders:true,extraReviewThreshold:70};
 const saved=S.save(st,newPrefs,{role:"owner",authorized:true,at:"2026-10-20T10:00:00Z"});
 assert.equal(st.securitySettings.securityAlerts,true);
 assert.deepEqual(saved.state.securitySettings,newPrefs);
 assert.equal(saved.entry.type,"SECURITY SETTINGS UPDATED");
 assert.ok(!saved.entry.message.includes("1234"));
 assert.equal(saved.entry.time,"2026-10-20T10:00:00Z");
});
test("critical policy toggles cannot be added or modified",()=>{
 assert.throws(()=>S.validate({...S.DEFAULT,allowStaffPayments:true}),/noncritical/);
 assert.throws(()=>S.validate({...S.DEFAULT,disableBankVerification:true}),/noncritical/);
 assert.throws(()=>S.validate({...S.DEFAULT,extraReviewThreshold:100}),/valid/);
});
test("legacy local state restores safe settings defaults",()=>{
 assert.deepEqual(S.normalize(null),S.DEFAULT);
 assert.equal(S.normalize({extraReviewThreshold:999}).extraReviewThreshold,30);
});
test("optional display settings do not control mandatory policy engine",()=>{
 for(const threshold of [30,50,70]){
 const advisory=S.advisory({securityAlerts:false,reviewReminders:false,extraReviewThreshold:threshold},75);
 assert.equal(advisory.mandatoryRiskRulesUnchanged,true);
 assert.equal(advisory.showReminder,false);
 }
});
test("owner settings UI and submit handler are present",()=>{
 const s=require("node:fs").readFileSync(require("node:path").join(__dirname,"../index.html"),"utf8");
 for(const key of ["ownerSecuritySettings","ownerSecurityForm","LedgertantSecuritySettings.save","security_settings","Verify PIN and save settings"])assert.ok(s.includes(key),key);
});
