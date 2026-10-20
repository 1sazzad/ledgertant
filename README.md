# Ledgertant — Secure SME Finance Copilot

**Interactive, static, serverless FinTech competition MVP.**

[Open the hosted demo](https://1sazzad.github.io/ledgertant/) (requires GitHub Pages enabled on `main`, root).

## The problem

SME owners juggle supplier invoices, duplicate bill risk, altered payment details, uncertain liquidity, financing decisions, and payment approval controls across disconnected tools.

## What the demo shows

1. **Command center** — live demo KPIs, flagged invoices, upcoming liquidity.
2. **Invoice intelligence** — rule-scored duplicate invoice IDs, supplier bank account changes, unfamiliar suppliers and unusually large invoices. Add your own synthetic invoice and observe the risk score.
3. **Cash-flow studio** — editable opening cash, weekly sales and operating costs; eight-week base, stress (-35% revenue) and growth (+20%) forecasts with invoice outflows.
4. **Financing navigator** — illustrative funding need under the stress scenario and a basic comparison of simple-interest financing models versus supplier extensions.
5. **Payment controls** — split staff/owner roles, mandatory review for medium/high risk, cash sufficiency checks, explicit approval, simulated ledger update, and audit records.
6. **Ask Ledgertant** — locally implemented, transparent, rules-based question answering on fraud, liquidity, funding and approvals.
7. **Security lab** — evaluate contextual permissions, blocked bank changes, untrusted data injection patterns, and approval-gating policy decisions.\n8. **Decision ledger** — persistent browser-side audit history and downloadable CSV export.

## Quick start

Open `index.html` in a modern browser. Or run a local static server, e.g. `python -m http.server 8000` and visit `http://localhost:8000`.

No Node, Python dependencies, API keys, database, signup, or backend are required to **run the app**. To run optional developer tests, install Node.js and execute `node --test tests/engine.test.js`.

## GitHub Pages

Repository → Settings → Pages → Build and deployment: **Deploy from a branch** → **main** → **/(root)** → Save.

The page will be served at https://1sazzad.github.io/ledgertant/ when GitHub finishes deployment.

## 3-minute judge journey

1. Open **Invoice intelligence**. Inspect the duplicate **BS-2401** and changed-bank **IT-800**. Show reasons and scores.
2. Add a new synthetic invoice and see automatic scoring.
3. Open **Cash-flow studio** and switch to the stress scenario. Change revenue or expense assumptions.
4. Open **Financing navigator** to compare costs of illustrative choices.
5. Open **Payment controls**. Switch to **Finance staff** and try payment: role control blocks it. Switch back to **Owner**; try a flagged invoice: it requires verification. Review, then approve a simulated payment.
6. Ask **Which invoices are risky?** in **Ask Ledgertant**.
7. Open **Security lab**: select an untrusted invoice-text source, insert the example prompt-injection attempt and show the **BLOCK** policy verdict. Then demonstrate staff vs owner and supplier bank-change denial.\n8. Open **Decision ledger** and export the audit CSV. Reset the demo for the next judge.

## Demo technology & limits

- Plain HTML, CSS and JavaScript; responsive layout.
- BDT amounts and fully synthetic vendor, invoice and bank-identifier values.
- Data persists in **the local browser only** via `localStorage`; Reset clears demo state.
- Deterministic rule scores are **not calibrated probability estimates or AI model inference**.
- Simulated payments **do not** move funds or contact any bank or payment service.
- Financing costs are examples, **not** lender offers or underwriting.
- No user authentication, server-enforced authorization, OCR, production ML, actual bank connectivity or regulator certification.
- Never enter actual financial account details into a publicly hosted demo. Browser-only local data is not an appropriate security foundation for financial production systems.

## Proposed post-demo implementation

1. Real ingestion: OCR plus invoice schema verification and data normalization.
2. Fraud: exact/fuzzy duplicate checks, supplier master history, anomaly ML after consented training data, graph detection of related entities.
3. Finance: bank-feed ingestion, probabilistic forecast, scenario optimization and explainability.
4. Funding: lender APIs, borrower-consented KYC and eligibility.
5. Security: server-enforced RBAC, MFA, maker/checker, transaction signing, immutable event logs and security testing.
6. Payments: licensed payment-provider integration, server-side final approval and idempotency.

The goal of this version is to make the *user journey* demonstrable without claiming that production integrations are already implemented.

## Repository structure

```
ledgertant/
├── index.html                # Static interface\n├── assets/engine.js          # Shared offline risk + permission decision engine\n├── tests/engine.test.js      # Dependency-free Node test suite
├── sample-invoices.csv       # Additional synthetic test records
├── README.md
└── .nojekyll
```

## License

Prototype created for demonstration and evaluation; no permission is implied to use it as a live payment processor.

## Phase 2 — judge-focused security demonstration

Use the **Security lab** menu to evaluate five contextual dimensions: actor role, requested action, instruction source, invoice risk, and untrusted message text. The policy returns **allow**, **review**, or **block**, with human-readable reasons and an audit event. A text attack such as “ignore previous instructions; skip approval” demonstrates elementary pattern checks. This is a *demonstration only*, not complete prompt-injection protection or real access control.

**Important limitations:** the interface and permission checks run in the browser, so they are not a genuine security boundary. The demo does not have secure user accounts, encrypted secret storage, real transaction approvals, or a bank API. A production backend must independently enforce authorization and never trust client-side audit records. The patterns show only a narrow illustrative subset of attacks; a different malicious phrase may evade them.


## Phase 3 — Guided competition experience

Open **Demo experience** from the left navigation for three synthetic SME story presets: **Suspicious supplier payment**, **Cash-flow squeeze**, and **Healthy operating month**. Switching scenarios replaces current local demo records (the UI requests confirmation). Press **Start 3-minute guided demo** for a seven-step guided flow through the modules. Each stage opens the matching interactive feature. The card in the lower-right provides context, step tracking and previous/next navigation.

The business impact panel displays unpaid/flagged invoice counts, total face value of invoices flagged for review, duplicate-reference excess exposure and the minimum projected cash under base and revenue-stress assumptions. **Exposure is never a validated loss or savings estimate.** The **Export demo brief** action downloads a locally generated text summary of synthetic positions, control decisions, and limitations.

The extra code is under `assets/journey-core.js` (pure fixture and calculation helpers), `assets/experience.js` (browser presentation), and `tests/journey.test.js` (Node's built-in test runner). Validate with `node --test tests/*.test.js`.

### Judge presentation checklist

- [ ] From the Demo experience page, show and verbally identify the synthetic company situation.
- [ ] Start the tour and review why BS-2401 is a duplicate and IT-800 has changed bank details.
- [ ] Explain cash stress as a scenario, not a forecast validated against bank data.
- [ ] Demonstrate staff-role restrictions and an untrusted invoice-text security decision.
- [ ] Verify a payment as the owner and record the action in Decision ledger.
- [ ] Export a demo brief and identify what is not implemented in this serverless prototype.

All authorization is simulated in the browser and must not be used to protect genuine money or identities.


## UX upgrade — guided decisions and explorable outcomes (October 2026)

This update turns the seven-step tour into an action-oriented demonstration. In **Security lab** (step 5), select **Finance staff → Release payment → Evaluate policy** to show why an unprivileged payment action is blocked. In **Payment controls** (step 6), click **Should I pay?** to open the invoice-specific decision panel. It distinguishes:

- **HOLD — do not pay yet:** suspicious/unverified invoice or insufficient cash.
- **OWNER APPROVAL REQUIRED:** staff may investigate but cannot release a payment.
- **Eligible for owner simulation:** controls pass; owner must still assess liquidity and explicitly confirm.
- **Simulated payment completed:** demo ledger only, with a local audit entry.

Each decision shows fraud rule signals, current cash after payment, eight-week stress floor, checklist, and next action. Owner demo verification is explicitly labelled as fictional confirmation and **does not remove the underlying warnings**. Changes in supplier banking details require genuine out-of-band verification in any production implementation; the demo does not perform that verification.

Step 7 guides users to the **Decision ledger**. Click an individual activity entry to inspect its contents or export the CSV. The **Demo experience** screen now includes expandable **Interactive result breakdown** cards that link to the relevant supporting evidence.

### Corrected finance behavior

Invoices marked `verified` remain unpaid until the user runs an eligible owner-only payment simulation. Their amounts are now properly retained in the eight-week cash-flow forecast. A rule-risk flag does not automatically make a payment safe or recommend paying.

### Validation

- Syntax checks performed for `index.html`, `assets/engine.js`, `assets/decision-core.js`, `assets/journey-core.js`, and `assets/experience.js`.
- Smoke-checked suspicious invoice HOLD verdict, retained supplier risk after demo verification, and inclusion of verified unpaid invoices in forecast outflows.
- Added `tests/decision.test.js`. Run all Node tests locally with `node --test tests/*.test.js`. Full browser end-to-end automation is not included.

## Competition upgrade — Payment Timing Decision Lab

New left-navigation module: **Decision lab**.

Judges can select any unpaid synthetic invoice, change the revenue scenario (base, 35% stress, or 20% growth), and set a minimum cash reserve. The client-side engine compares **pay now**, **pay on due week**, and **request a two-week extension**, showing projected lowest cash, closing cash, weeks below the reserve, and an eight-week trajectory. Options are hypotheticals, not actual payment requests or a supplier-approved extension.

Risk and role gates remain visible: changed bank details and other suspicious invoices produce a HOLD; finance staff require owner authorization; insufficient cash blocks payment. The underlying finance model is simple weekly deterministic cash flow, not a trained forecaster.

Technical pieces:
- `assets/decision-lab-core.js`: pure side-effect-free evaluation; never modifies the actual ledger
- `tests/decision-lab.test.js`: twelve assertions for timing, liquidity, role/risk gates, non-mutation, horizon disclosures
- `index.html`: new accessible interactive Decision Lab interface

**Suggested competition showcase:** load the suspicious supplier story, open the Decision Lab, select a suspicious invoice, demonstrate HOLD; then compare a legitimate invoice under stress, select the three different timing cases and explain why a human must approve. Show the Decision ledger to close the loop.

**Technical validation:** 47 JavaScript assertions and syntax checks completed in an isolated JS evaluator during preparation. GitHub Actions has reported jobs failing before a runner started; independent GitHub-hosted CI validation is not yet confirmed. Full cross-browser testing is still recommended.

### Evidence and limitations

No claim is made of measured fraud prevention, saved funds, bank integrations, a live LLM, validated credit offers, enforcement-grade authorization, or immutable audit history. Any real implementation would require server-side identity, strong approvals, supplier verification, licensed payments, user consent, model evaluation and appropriate jurisdictional compliance.

## Demo workflow update: Owner/Staff and invoice rejection (October 2026)

A visible **Demo role** switcher in the header now chooses **Business Owner** or **Finance Staff** and persists the simulated role in browser storage. This is a role-play permission demo and not identity verification or secure production access.

From **Invoice intelligence** or **Payment controls**, open an unpaid invoice. A Finance Staff actor can **Recommend rejection** with a reason; the invoice remains unpaid/payable until an Owner decides. The Business Owner may **Reject invoice** with a required reason selection (Duplicate, Incorrect bank details, Incorrect amount or Other; Other requires a written note). Confirming sets the status to \`rejected\`, records an audit event, and prevents payment. Rejected invoices remain visible through the **Status → Rejected** invoice filter and still retain their original warning evidence. They are excluded from future payment outflows in the eight-week forecast; there is no cash deduction for rejection.

### Rejection acceptance test
1. Reset demo; choose Finance Staff in the header and review \`IT-800\`. Use **Recommend rejection** with the incorrect-bank-details reason.
2. Check that the invoice remains unpaid, available in the queue, and a recommendation appears in Decision ledger.
3. Choose Business Owner and review \`IT-800\`. Select **Reject invoice**, choose Incorrect supplier bank details and confirm.
4. Check the **Rejected** filter, inspect the reason and original warning, verify the invoice disappears from payment-eligible items, and confirm that the forecast no longer includes its payable outflow.
5. Check Decision ledger for the dated owner rejection entry. No bank transfer occurs.

Tests: \`node --test tests/*.test.js\` including \`tests/invoice-workflow.test.js\`, with GitHub Actions invoking tests after a push. The app remains fully static and client-side.

## Invoice Decision Center — formal approval before payment (October 2026)

The user journey is now **screen invoice → review → request verification / recommend → owner approve or reject → payment controls → explicit owner payment confirmation → audit**.

1. Start in **Invoice intelligence**, select an invoice and click **Review**.
2. **Finance Staff** may recommend approval/rejection or request verification. These actions are advisory, not final decisions.
3. **Business Owner** may request verification, record a fictional external-verification attestation with an explanation, approve an invoice with an approval reason and checkbox, or reject it with a reason.
4. High-risk/medium-risk invoices **cannot be approved without an owner verification record**. Prior legacy `verified` status is not by itself sufficient.
5. An approved invoice remains financially outstanding; **invoice approval does not deduct cash or execute a payment**. The payment screen only lists invoices with `approved` status and requires a separate explicit owner authorization.
6. Rejected or paid invoices are ineligible for another release. Rejected entries retain risk evidence and are excluded from future invoice cash outflows.

All decisions persist in browser localStorage and write to Decision ledger. All roles, attestations, and financial transactions are local synthetic demonstrations, not authenticated enterprise authorization, live identity verification, or bank transfers.

**Acceptance test:** Reset the demo → Finance Staff reviews IT-800 and requests verification → Business Owner tries to approve IT-800 (blocked) → records independently performed demo verification → approves with written reason → opens Payment Controls → confirms a distinct simulated payment → inspects both records in Decision ledger. Check low-risk MP-1077 also needs formal invoice approval first.

CI: `node --test tests/*.test.js`. Github Actions checks JavaScript syntax and executes the test suite on each push.

## Invoice Intelligence status lists

Invoice Intelligence now has clickable live-count tabs: **All, Pending, Under Review, Approved, Rejected, Paid**. Legacy `verified` records display under **Under Review** rather than appearing in a separate list. A count reflects each invoice's current status, not the number of audit activities.

- New invoices appear in **Pending**.
- Staff approval/rejection recommendations, verification requests and recorded owner verifications appear in **Under Review**.
- Final owner approval moves an invoice to **Approved**. The approved invoice remains unpaid and its button opens **Payment Controls**; no funds move on approval.
- Final owner rejection moves the invoice to **Rejected**, preserving the reason and original warning evidence but removing it from payable outflows.
- A separate owner-authorized simulated payment moves an approved invoice to **Paid**.
- The app updates the current status list immediately after an action; other lists remain available through the tabs. Counts are derived from the local invoice state on each render.

For end-to-end testing, reset the demo, review IT-800 with Finance Staff and recommend rejection, confirm it appears in Under Review, switch to Business Owner, record external verification, approve it and check Approved, then simulate payment in Payment Controls and check Paid. Repeat with a separate invoice to test Rejected. Automated model tests are in `tests/invoice-queue.test.js`.

## Demo role PIN and payment confirmation — Test 7 update

**Demo PIN: 1234.** This number is displayed publicly in the interface and is for illustrating workflow only, not real user authentication. Do not enter a personal or banking PIN.

**Test 7.1 — Staff role:** Reset the demo. MP-1077 initially appears in Invoice Intelligence (Pending), not in Payment Controls. Choose Finance Staff and review the invoice; staff cannot finalize its approval. Attempt to change the header role to Business Owner. Enter an incorrect demo PIN: role stays Finance Staff. Enter 1234: Owner role activates. Approve the invoice in Invoice Intelligence. Switch back to Finance Staff and verify that staff cannot authorize its simulated payment.

**Test 7.2 — Owner payment:** Switch to Business Owner with 1234. Open Payment Controls, find approved MP-1077 and select payment eligibility. The simulated payment confirmation requests its own PIN. Incorrect PIN must leave the invoice Approved and the balance unchanged. Enter 1234 and confirm the subsequent simulated payment prompt. The invoice appears under Paid and its actions appear in Decision ledger.

Cancellation does not change the role or invoice. Audit records show accepted and denied demonstration PIN attempts, but never the PIN itself. This client-side feature does not provide secure access control for actual funds.

## Payment balance dashboard and confirmation — Test 7.3 and Test 7.4

**Payment Controls** now displays the current synthetic BDT cash balance prominently, the number/value of approved invoices, an illustrative remaining balance if all approved invoices were paid, and a link to payment history after the first simulated payment.

**Test 7.3 — successful simulated payment:** Reset demo; switch to Business Owner (demo PIN 1234 after switching from Finance Staff if applicable). In Invoice Intelligence, approve low-risk MP-1077 with an explanation and confirmation. In Payment Controls, check cash before payment (BDT 425,000). Open its Payment review and select Confirm owner simulation; enter demo PIN 1234. The subsequent final breakdown must show BDT 425,000 before, BDT 55,200 to deduct, BDT 369,800 afterward. Cancel leaves the balance and Approved invoice unchanged. If confirmed, a receipt shows these amounts; Payment Controls updates to BDT 369,800; the invoice moves to Paid, and Decision Ledger records the before/after amounts. No bank transfer occurs.

**Test 7.4 — insufficient funds:** Reset demo, approve MP-1077 in Invoice Intelligence first, then use Cash-flow studio to set opening cash to BDT 10,000. Return to Payment Controls and open MP-1077. Attempt to authorize a simulated payment. It must be blocked with insufficient-funds feedback, the invoice must remain Approved, the balance must remain BDT 10,000, and an audit event must record the block. Do not look for the unapproved invoice in the Payment queue directly after Reset, because that queue intentionally lists only Approved invoices.

The final payment simulation re-checks owner role, invoice approval, configured risk warnings and cash sufficiency before deducting funds. All calculations and records are synthetic, held in browser local storage, and are not a substitute for authenticated payment processing.

## Payment Controls — blocked-payment explanation and separate history

**Test 7.4 (revised):** Reset demo. In Invoice Intelligence, select Business Owner and approve the low-risk invoice MP-1077. Then go to Cash-flow studio and reduce opening cash to BDT 10,000. Return to Payment Controls; MP-1077 remains in the approved payment queue, but a warning explains that cash is insufficient. Click **Payment review**: the detail panel must show **Available BDT 10,000; invoice BDT 55,200; shortfall BDT 45,200** and explain why confirmation is unavailable. If an owner tries to release the payment, it remains blocked. Verify that cash stays BDT 10,000, the invoice stays Approved, and **no successful payment** appears.

**Decision Ledger** now separates **Successful payments** from **Blocked attempts** and **All activity**. A failed attempt is allowed in Blocked attempts as an audit trail, but it is never called a completed payment. Successful payments appear only after confirmation and an actual local ledger update. Both sections reflect browser-only synthetic data; no external transfer is performed.

## Owner Security Settings — Phase 8 acceptance test

Security Lab now has a **Owner Security Settings** panel, independent from the policy simulator. The page-header **Demo role** must be Business Owner to edit these preferences. Finance Staff sees the settings but cannot save them.

**Test 8.1 — Staff privileges:** Reset the demo, choose Finance Staff, open Security Lab, set actor Finance Staff / Release payment / Trusted app / MP-1077 and evaluate. It must return **BLOCK**; optional settings never permit staff payments.

**Test 8.2 — Suspicious instructions:** In Security Lab use **Insert example attack** and evaluate. It must return **BLOCK** and explain why untrusted instructions are not permitted to control payments.

**Test 8.3 — Owner settings:** Select Business Owner (enter demo PIN 1234 when switching from Staff), open Security Lab, adjust Additional security alerts, Invoice review reminders, and a review reminder threshold of 30 / 50 / 70. Click **Verify PIN and save settings**, enter a wrong PIN first and verify no changes saved, then enter 1234. Successful save updates the panel status and creates **SECURITY SETTINGS UPDATED** in Decision Ledger, but does not store the entered PIN. Reload to confirm browser-local persistence. Finance Staff must not be able to save settings.

These controls govern only optional demonstration alerts and reminders. **Noneditable safeguards** include owner-only payment release, independent verification for flagged invoices, payment blocks for rejected/unapproved invoices, supplier bank changes, and untrusted instruction isolation. This is a client-side static demonstration and the public PIN is not secure identity verification.

## Clear Finance interface refresh (October 2026)

The dashboard now uses a bright high-contrast workspace with a dark grouped sidebar, plainer navigation labels (Overview, Invoices, Cash flow, Funding options, Compare payment options, Payments, History & activity, Guided demo, Security & controls, and Ask Ledgertant), and a simple **Review → Approve/reject → Pay** three-step introduction. Layout and accessibility styling live in `assets/theme-polish.css`, loaded after the responsive stylesheet. These are presentation-only changes; no scoring, role, audit, or payment authorization rules were changed.

Visual acceptance checklist: confirm desktop and mobile navigation show every section, the Owner PIN modal and payment receipt remain legible, invoice status tabs and Decision Lab choices have clear selected states, warning/success colors remain readable, and the tour can be minimized or dismissed. The app uses browser-local synthetic data; test key workflows after deployment.

## Final release QA — Visual, navigation and workflow acceptance

**Code verification:** GitHub Actions checks source syntax, Node unit tests, and the static interface contract in `tests/release-contract.test.js`. The contract checks that referenced local assets exist, all ten views are present, critical workflow hooks remain connected, and desktop/mobile sidebar rules and safety disclosures remain intact. This **does not replace** real browser or accessibility testing.

**Recommended final browser walkthrough (desktop and mobile):**

- **Navigation:** At 100% zoom and short browser height, scroll the sidebar to access all ten pages; the OFFLINE DEMO MODE footer must never overlap Guided demo, Security & controls, or Ask Ledgertant. Verify only one page shows its selected state.
- **Mobile:** At 360px–430px width, open the menu, visit each page and close it. No content should require horizontal page scrolling; invoice tables may scroll inside their own containers.
- **Invoice lifecycle:** Reset → Owner approves a clean sample invoice → it moves to Approved → Payments shows it → separate PIN and final confirmation → it moves to Paid and the remaining balance updates. Test rejected and under-review paths independently.
- **Insufficient funds:** Lower opening cash in Cash flow, try to pay an approved invoice; confirm the visible block and shortfall, unchanged balance and invoice status, and separate Blocked attempts history.
- **Decision Lab:** Switch timing and revenue scenario; look for the highlighted option, updated comparison figures, and corresponding chart.
- **Security:** Staff cannot release payment; owner security preferences require the publicly disclosed demonstration PIN and cannot disable protected safeguards.
- **Funding options:** Change a funding amount; explanatory costs update and all assumed rates are labeled as illustrative.
- **Guided demo / dialogs:** Buttons, close controls, ESC (where supported), keyboard focus, and mobile sheet positioning should remain usable. Check contrast and legibility.
- **Persistence and Reset:** Refresh after a completed demo action to confirm browser-local state is preserved; Reset returns synthetic starting data.

**Release policy:** No real transfers, real bank connections, real authentication, production fraud probabilities, or guaranteed financing are claimed. Use synthetic data only. Keep source and GitHub Pages aligned, and record deployment SHA before a live demonstration.
