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
