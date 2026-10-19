/* Invoice Intelligence status-board model. Pure helpers; no server calls or DOM state. */
(function(root){
"use strict";
const TABS=Object.freeze([
 Object.freeze({id:"all",label:"All"}),
 Object.freeze({id:"pending",label:"Pending"}),
 Object.freeze({id:"under_review",label:"Under Review"}),
 Object.freeze({id:"approved",label:"Approved"}),
 Object.freeze({id:"rejected",label:"Rejected"}),
 Object.freeze({id:"paid",label:"Paid"})
]);
function bucket(status){
 if(status==="verified"||status==="under_review")return "under_review";
 if(["pending","approved","rejected","paid"].includes(status))return status;
 return "other";
}
function counts(invoices=[]){
 const result=Object.fromEntries(TABS.map(tab=>[tab.id,0]));
 for(const invoice of invoices){result.all++;const key=bucket(invoice.status);if(key in result)result[key]++;}
 return result;
}
function filtered(invoices=[],tab="all"){
 if(tab==="all")return invoices.slice();
 if(!TABS.some(x=>x.id===tab))return [];
 return invoices.filter(i=>bucket(i.status)===tab);
}
function nextTab(action){
 if(action==="approve")return "approved";
 if(action==="reject")return "rejected";
 if(action==="pay")return "paid";
 if(["verify","request","recommend","recommend_reject"].includes(action))return "under_review";
 if(action==="create")return "pending";
 return "all";
}
function actions(status,role){
 const statusGroup=bucket(status),owner=role==="owner";
 if(statusGroup==="pending"||statusGroup==="under_review")
   return owner?["review","approve","verify","reject"]:["review","recommend","request","recommend_reject"];
 if(statusGroup==="approved")return owner?["review","payment","reject"]:["review","payment"];
 return ["review"];
}
root.LedgertantInvoiceQueue=Object.freeze({TABS,bucket,counts,filtered,nextTab,actions});
})(globalThis);
