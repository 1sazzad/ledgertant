# Responsive QA Matrix — Ledgertant

## Implemented improvements

- Desktop: persistent sidebar and flexible content area.
- Tablet (up to 900px): sticky horizontally scrollable section navigation; one-column analytics, two-column story cards where space permits.
- Mobile (up to 640px): compact topbar, single-column cards, 44px minimum touch targets, adaptable headings and forms.
- Narrow mobile (up to 360px): tighter margins and safe button sizing.
- Invoice tables: horizontal scroll with keyboard-focusable region and visible swipe hint.
- Payment and audit details: scrollable bottom-sheet treatment on phone widths with page scroll locked while open.
- Guided walkthrough: mobile bottom sheet, minimization, viewport height limits, and extra content padding while running.
- Reduced-motion preferences: remove smooth scrolling.

## Source verification performed

- Syntax parse: inline `index.html` JavaScript and `assets/experience.js`.
- Verified link from HTML to `assets/responsive.css`.
- Verified expected media rules and tour-minimization handler.

## Browser checks to finish before release

Use Chrome DevTools or real-device testing at these widths:

| Viewport | Checklist |
| --- | --- |
| 320x568 | No page-wide overflow; navigation swipe; compact dialog buttons |
| 360x740 | No clipped headings, top toolbar, or action buttons |
| 375x812 | Invoice table scroll; payment bottom sheet; tour minimize |
| 390x844 | Story cards, Decision Lab selectors and chart labels |
| 768x1024 | Sticky navigation, two-column scenarios, readable content |
| 1024x768 | Sidebar / content distribution; form widths |
| 1440x900 | Full desktop sidebar, dashboard, four KPIs |

### Test flows

1. Reset synthetic data; visit Overview and open a risk invoice dialog.
2. Invoice intelligence: open a flagged invoice, inspect risk, close using button and Escape.
3. Payments: switch staff/owner, inspect decision, verify flagged invoice (demo), approve eligible payment.
4. Decision Lab: select invoice, set stress mode and cash buffer, choose all three timing cards.
5. Start guided walkthrough, minimize and expand on mobile; verify Close and Finish work.
6. Audit: inspect an event and export CSV.
7. Keyboard: tab through the menu and forms; arrow-scroll invoice region.
8. Inspect for clipped text, overlapping floating panels, body-level horizontal scroll, and touch target size.

**Evidence status:** Static checks completed. Real device/browser screenshot comparison and end-to-end interaction validation must still be performed. GitHub Actions may fail to acquire a hosted runner; this does not constitute a passing CI run.
