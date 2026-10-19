/* Public, browser-only demonstration PIN. NOT real authentication or payment security. */
(function(root){
"use strict";
const DEMO_PIN="1234";
const allowedActions=Object.freeze(["role_switch","payment"]);
function validate({action,role,pin,invoice}={}){
 if(!allowedActions.includes(action))return {ok:false,code:"unsupported",message:"Unknown demo authorization action."};
 if(action==="payment"&&role!=="owner")return {ok:false,code:"role",message:"Only the Business Owner demo role can confirm a simulated payment."};
 if(action==="payment"&&(!invoice||invoice.status!=="approved"))return {ok:false,code:"invoice",message:"Only formally approved invoices can be submitted for simulated payment."};
 if(typeof pin!=="string"||!/^\d{4}$/.test(pin)||pin!==DEMO_PIN)
  return {ok:false,code:"invalid_pin",message:"Incorrect demo PIN. Try the displayed 4-digit demonstration PIN."};
 return {ok:true,code:"accepted",message:"Demo PIN accepted. This does not verify a real person's identity."};
}
function audit({action,role,invoice,ok,time=new Date().toISOString()}={}){
 if(!allowedActions.includes(action))throw new Error("Unknown demo authorization action.");
 const subject=action==="role_switch"?"Switch Finance Staff to Business Owner":"Simulated payment "+String(invoice?.ref??"(unknown invoice)");
 return {time:String(time),type:ok?"DEMO PIN ACCEPTED":"DEMO PIN DENIED",
   message:subject+" · "+(ok?"Demo PIN entered correctly.":"Demo PIN was incorrect.")+" Browser-only simulation; no PIN stored."};
}
root.LedgertantDemoPIN=Object.freeze({validate,audit,DEMO_PIN});
})(globalThis);
