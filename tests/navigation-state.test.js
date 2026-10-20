const {test}=require("node:test");const assert=require("node:assert/strict");
require("../assets/navigation-state-core.js");const N=globalThis.LedgertantNavigationState;
const store=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
test("all ten routes roundtrip across refresh",()=>{const s=store();for(const route of N.ROUTES){assert.equal(N.save(route,s),route);assert.equal(N.read(s),route)}});
test("invalid and tampered route falls back to overview",()=>{const s=store();s.setItem(N.KEY,"<script>alert(1)</script>");assert.equal(N.read(s),"overview");assert.equal(N.save("invalid",s),"overview")});
test("unavailable browser storage never breaks navigation",()=>{const blocked={getItem(){throw Error("denied")},setItem(){throw Error("denied")}};assert.equal(N.read(blocked),"overview");assert.equal(N.save("payments",blocked),"payments")});
test("app initializes current page from storage and centralizes navigation",()=>{const fs=require("node:fs"),path=require("node:path");const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");for(const item of ["let current=LedgertantNavigationState.read()","LedgertantNavigationState.save(view)","globalThis.LedgertantNavigate=openPage","openPage(n.dataset.nav)","openPage(\"audit\")","openPage(\"copilot\")"])assert.ok(html.includes(item),item)});
