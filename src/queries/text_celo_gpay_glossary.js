const metric = {
  id: 'text_celo_gpay_glossary',
  name: 'Gnosis Pay on Celo — Metrics Glossary',
  description: 'Definitions of key concepts, KPIs, and action types used across the Celo Gnosis Pay dashboard',
  chartType: 'text',
  content: `

## About

Gnosis Pay 2.0 launched on **Celo** together with **MiniPay**. This dashboard tracks the Celo deployment of the Gnosis Pay card program. Each user is a Gnosis Pay card **Safe** (smart account).

**Token scope.** All metrics currently cover **USDC** and **USDT** only — the two settlement tokens tracked at launch. Volumes, balances, and counts exclude any other token until it is explicitly onboarded. When new settlement tokens are added, they will be incorporated here.

---

## Key Performance Indicators

| KPI | Definition |
|-----|-----------|
| **MAU (Monthly Active Users)** | Distinct card Safes with any Gnosis Pay activity (payments, top-ups, withdrawals) in a given calendar month. |
| **Payment MAU** | Subset of MAU — distinct Safes that made at least one card payment (Safe → merchant transfer) in a calendar month. |
| **Deposit MAU** | Distinct Safes that performed at least one top-up in a calendar month. |
| **Withdrawal MAU** | Distinct Safes that performed at least one withdrawal in a calendar month. |
| **ARPU (Avg Revenue Per User)** | Total payment volume (USD) ÷ Payment MAU for a given month. Measures average card spending per paying Safe — not Gnosis Pay platform revenue. |
| **Repeat Purchase Rate** | Percentage of paying Safes that made 2 or more card payments within a calendar month. Formula: (Safes with 2+ payments ÷ total paying Safes) × 100. |
| **Churn Rate** | Percentage of Safes active in the current month who are not active the following month. Formula: (churned Safes ÷ total active Safes) × 100. Tracked separately for "Payment only" and "Any activity" scopes. |
| **Retention Rate** | Percentage of the previous month's active Safes who remain active in the current month. Formula: (retained Safes ÷ previous month total active) × 100. |
| **Net Flow** | Total top-ups minus total withdrawals in USD. |

---

## User Lifecycle Segments

| Segment | Definition |
|---------|-----------|
| **New** | Safes in their first month of activity. |
| **Retained** | Active in both the current and previous month. |
| **Returning** | Previously active, had at least one inactive month, now active again. |
| **Churned** | Active in the current month but not in the following month. |

---

## Cohort Retention

Safes are grouped by the month of their first card payment (activation cohort). Each subsequent month shows what percentage of that original cohort remains active. Tracked by both Safe count and payment volume.

**Reading the heatmap:**
- Each **row** is a cohort grouped by first-payment month.
- Each **column** is a calendar month.
- **%** — What percentage of the cohort was active that month.
- **#** — How many Safes from the cohort were active.
- **$** — Total payment volume (USD) from that cohort.

---

## Action Types

| Action | Direction | Definition |
|--------|-----------|-----------|
| **Payment** | Safe → Merchant | Card spend at point of sale. |
| **Top-up** | External → Safe | Funds added to the card Safe. |
| **Withdrawal** | Safe → External | Funds moved out of the card Safe. |
| **Reversal** | Merchant → Safe | Reversed or refunded transaction. |

---

## Wallet & Balance Concepts

| Concept | Definition |
|---------|-----------|
| **Funded Card** | A card Safe that has ever **received** money (any inbound top-up). Counted from the date of its first inbound transfer. Cumulative and monotonically increasing. Not the same as the Gnosis Chain "Funded" tile, which is still payment-derived. |
| **Activated Card** | A card Safe that has ever **spent** (settled at least one Payment to a settlement contract). Strictly ≤ Funded. |
| **Funding channel** | Shape of how a card was funded (\`cip64_direct_solo\`, \`hub\`, \`mediated\`, …) — not a MiniPay identity label. CIP-64 alone is not MiniPay. |
| **Balance (net-flow method)** | Per-Safe, per-token balance computed as cumulative tracked inflows minus tracked outflows. Because Gnosis Pay Safes on Celo start empty and the tracked transfer set captures their USDC/USDT movements, this closely reflects the on-chain balance for the two tracked tokens. |
| **Balance Cohorts** | Safes grouped by their balance tier (e.g., 0–10, 10–100, 100–1K). Shows distribution of holders and value across tiers. |

---

## Tokens

| Token | Description |
|-------|-----------|
| **USDC** | USD Coin on Celo. Settlement token for card payments. |
| **USDT** | Tether USD on Celo. Settlement token for card payments. |

_Additional tokens will be added to all metrics as they are onboarded to Gnosis Pay on Celo._

`
};

export default metric;
