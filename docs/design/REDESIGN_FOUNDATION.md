# Pocketii approved redesign foundation

This document locks the visual and structural decisions approved for the Pocketii redesign. The implementation must preserve the existing product capabilities and backend routes while adopting this shell consistently.

## Source of truth

- Interactive preview: `/wireframe`
- Static preview asset: `/static/redesign/approved-pocketii-redesign.html`
- Shared tokens: `frontend/static/css/redesign-tokens.css`
- Shared icon macro: `frontend/templates/components/redesign_icon.html`

## Navigation structure

### Overview
- Dashboard
- Accounts
- Transactions
- Cash Flow

### Planning
- Budgets
- Recurring
- Goals

### Wealth
- Investments
- Guidance
- Insights & Reports

### Manage
- Household
- Settings

The redesign must not remove the existing expense, income, transfer, receipt, import, budget, recurring, savings goal, investment, recommendation, anomaly, forecast, report, household, integration, notification, session, security, or export workflows.

## Visual rules

- Use Inter throughout the authenticated application.
- Use the approved blue sidebar and compact white content surfaces.
- Use inline SVG icons from the Pocketii icon macro; do not introduce emoji or icon-font-only navigation.
- Pair every primary navigation icon with a text label.
- Use compact bordered cards rather than oversized floating panels.
- Use green and red only for financial meaning and status.
- Keep tables dense enough for financial review while retaining mobile alternatives.
- Keep desktop sidebar, sticky top bar, mobile bottom navigation, and mobile More sheet consistent across pages.

## Migration rule

The redesign is a presentation-layer migration. Existing API paths, authentication, household scope, security middleware, integrations, and service boundaries remain in place. Static values in the preview are illustrative only and must be replaced with live API data during page migration.

## PR sequence on the `redesign` branch

1. Foundation and approved shell preview.
2. Dashboard, accounts, and transactions.
3. Cash flow, budgets, recurring, and goals.
4. Investments and guidance.
5. Insights, household, and settings.
6. Native mobile parity and final production validation.

All future redesign work continues on the single `redesign` branch until the complete redesign is ready for production review.
