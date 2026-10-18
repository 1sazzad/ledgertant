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
7. **Decision ledger** — persistent browser-side audit history and downloadable CSV export.

## Quick start

Open `index.html` in a modern browser. Or run a local static server, e.g. `python -m http.server 8000` and visit `http://localhost:8000`.

No Node, Python dependencies, API keys, database, signup, or backend are required.

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
7. Open **Decision ledger** and export the audit CSV. Reset the demo for the next judge.

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
├── index.html                # Entire self-contained demo application
├── sample-invoices.csv       # Additional synthetic test records
├── README.md
└── .nojekyll
```

## License

Prototype created for demonstration and evaluation; no permission is implied to use it as a live payment processor.
