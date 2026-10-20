/*
 * Final release-contract checks for the static Ledgertant interface.
 * These tests validate source wiring and invariants; they are not browser
 * rendering or full end-to-end tests.
 */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const html=read("index.html");
const layout=read("assets/layout-final.css");
const theme=read("assets/theme-polish.css");
const typography=read("assets/typography.css");
const responsive=read("assets/responsive.css");

test("all local CSS and JS entry points referenced in HTML exist",()=>{
 const references=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)]
 .map(m=>m[1].split("?")[0]).filter(s=>s.startsWith("./assets/"));
 assert.ok(references.length>=10,"Expected local style and script assets");
 for(const ref of references){
  const absolute=path.join(root,ref);
  assert.ok(fs.existsSync(absolute),"Missing local asset: "+ref);
 }
});
test("all ten page views and grouped routes are present",()=>{
 const routes=["overview","invoices","cashflow","financing","decisionlab",
 "payments","audit","journey","security","copilot"];
 for(const route of routes){
  assert.match(html,new RegExp('id="'+route+'"'),"Missing "+route+" page view");
  assert.ok(html.includes('"'+route+'"'),"Missing "+route+" navigation route");
 }
 for(const label of ["YOUR BUSINESS","MAKE DECISIONS","HELP & SECURITY"])
  assert.ok(html.includes(label),"Missing navigation group "+label);
});
test("desktop sidebar keeps footer outside independently scrolling navigation",()=>{
 assert.match(layout,/@media\s*\(min-width:\s*901px\)/);
 assert.match(layout,/\.side\s*\{[^}]*display:flex;[^}]*flex-direction:column;[^}]*overflow:hidden/s);
 assert.match(layout,/\.side \.menu\s*\{[^}]*overflow-y:auto/s);
 assert.match(layout,/\.side \.side-bottom\s*\{[^}]*position:static/s);
 assert.match(layout,/\.side \.nav\.active/);
 assert.match(responsive,/\.mobile-menu-toggle/);
 assert.match(responsive,/\.side\.menu-open \.menu/);
});
test("current theme supplies readable typography and contrast variants",()=>{
 assert.match(theme,/color-scheme:light/);
 assert.match(typography,/font-size:16px/);
 assert.match(typography,/font-variant-numeric:tabular-nums/);
 assert.match(typography,/\.side \.nav/);
 assert.match(theme,/\.invoice-status-rejected/);
 assert.match(theme,/\.payment-warning/);
});
test("invoice status movement, decision lab and payment navigation are connected",()=>{
 for(const token of ["invoice-queue-core.js","flow.approve(state,args,LedgertantEngine)",
 "LedgertantInvoiceQueue.nextTab","labChoiceComparison","labLiveSummary",
 "paymentBalanceDashboard","paymentConfirmDialog","LedgertantPaymentLedger.settle",
 "data-audit-tab","Blocked attempts"])
 assert.ok(html.includes(token),"Missing workflow wiring "+token);
});
test("demo identity boundary remains transparent and critical settings immutable",()=>{
 for(const token of ["DEMO-ONLY AUTHORIZATION","demoPinForm","security-settings-core.js",
 "LedgertantSecuritySettings.save","No live banking integration"])
 assert.ok(html.includes(token),"Missing safety disclosure or control "+token);
 const rules=read("assets/security-settings-core.js");
 assert.match(rules,/Only Business Owner may edit/);
 assert.match(rules,/Mandatory safeguards remain active/);
});

test("accidental Create Invoice click can be cancelled without a ledger mutation",()=>{
 for(const token of ['id="addToggle"','aria-controls="addForm"','data-close-invoice-form','closeInvoiceForm()','invoice-create-actions','type="button" data-close-invoice-form>Cancel'])
  assert.ok(html.includes(token),"Missing invoice cancel UI: "+token);
 assert.match(html,/const closeInvoiceForm=\(\)=>\{[^}]*style\.display="none"/);
 assert.match(html,/panel\.querySelector\("form"\)\?\.reset\(\)/);
});
