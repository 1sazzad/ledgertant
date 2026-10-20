/* Remember the last selected Ledgertant section across refreshes.
   Navigation preference only; separate from the synthetic business ledger. */
(function(root){
"use strict";
const KEY="ledgertant-last-page-v1";
const ROUTES=Object.freeze([
 "overview","invoices","cashflow","financing","decisionlab",
 "payments","audit","journey","security","copilot"
]);
function normalize(page){return typeof page==="string"&&ROUTES.includes(page)?page:"overview"}
function read(storage){
 try{
  const target=storage===undefined?root.localStorage:storage;
  return normalize(target?.getItem(KEY));
 }catch(_){return "overview"}
}
function save(page,storage){
 const normalized=normalize(page);
 try{
  const target=storage===undefined?root.localStorage:storage;
  target?.setItem(KEY,normalized);
 }catch(_){/* still navigate when storage is unavailable */}
 return normalized;
}
root.LedgertantNavigationState=Object.freeze({KEY,ROUTES,normalize,read,save});
})(globalThis);
