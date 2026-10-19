/* Local-only Security Lab preferences. Core payment policies cannot be edited here. */
(function(root){
"use strict";
const DEFAULT=Object.freeze({securityAlerts:true,reviewReminders:true,extraReviewThreshold:30});
const THRESHOLDS=Object.freeze([30,50,70]);
const PROTECTED=Object.freeze([
 "Owner-only payment release",
 "Independent verification for flagged invoices",
 "Rejected and unapproved invoice payment blocks",
 "Supplier bank-account changes remain blocked",
 "Untrusted instructions cannot authorize financial operations"
]);
function normalize(input){
 const o=input&&typeof input==="object"?input:{};
 return {
  securityAlerts:typeof o.securityAlerts==="boolean"?o.securityAlerts:DEFAULT.securityAlerts,
  reviewReminders:typeof o.reviewReminders==="boolean"?o.reviewReminders:DEFAULT.reviewReminders,
  extraReviewThreshold:THRESHOLDS.includes(o.extraReviewThreshold)?o.extraReviewThreshold:DEFAULT.extraReviewThreshold
 };
}
function validate(draft){
 if(!draft||typeof draft!=="object"||Array.isArray(draft))throw Error("Security settings are missing.");
 const keys=Object.keys(draft).sort();
 const allowed=Object.keys(DEFAULT).sort();
 if(keys.length!==allowed.length||keys.some((key,i)=>key!==allowed[i]))
  throw Error("Only noncritical security display preferences can be edited.");
 if(typeof draft.securityAlerts!=="boolean"||typeof draft.reviewReminders!=="boolean"||
    !THRESHOLDS.includes(draft.extraReviewThreshold))
  throw Error("Select valid security preferences and review threshold.");
 return {...draft};
}
function save(state,draft,{role,authorized=false,at=new Date().toISOString()}={}){
 if(role!=="owner")throw Error("Only Business Owner may edit demonstration security settings.");
 if(!authorized)throw Error("Enter the owner demo PIN before saving security settings.");
 if(!state||!Array.isArray(state.audit))throw Error("Demo ledger unavailable.");
 const settings=validate(draft),before=normalize(state.securitySettings);
 const diff=Object.keys(DEFAULT).filter(k=>before[k]!==settings[k]).map(k=>k+": "+String(before[k])+" → "+String(settings[k]));
 const entry={time:String(at),type:"SECURITY SETTINGS UPDATED",
   message:"Business Owner changed demo preferences: "+(diff.length?diff.join("; "):"No changes")+". Mandatory safeguards remain active. No PIN stored."};
 return {state:{...state,securitySettings:settings,audit:[entry,...state.audit]},entry};
}
function advisory(settings,score){
 const opts=normalize(settings);
 return {showAlerts:opts.securityAlerts,showReminder:opts.reviewReminders&&Number(score)>=opts.extraReviewThreshold,
  threshold:opts.extraReviewThreshold,mandatoryRiskRulesUnchanged:true};
}
root.LedgertantSecuritySettings=Object.freeze({DEFAULT,THRESHOLDS,PROTECTED,normalize,validate,save,advisory});
})(globalThis);
