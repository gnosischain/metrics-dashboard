const metric = {
  id: 'text_gpay_glossary',
  name: 'Gnosis Pay — Metrics Glossary',
  description: 'Definitions of key concepts, KPIs, and action types used across the Gnosis Pay dashboard',
  chartType: 'text',
  content: `

## Key Performance Indicators

| KPI | Definition |
|-----|-----------|
| **MAU (Monthly Active Users)** | Distinct wallet addresses with any Gnosis Pay activity (payments, deposits, withdrawals, cashback) in a given calendar month. |
| **Payment MAU** | Subset of MAU — distinct wallets that made at least one card payment (wallet → merchant transfer) in a calendar month. |
| **Deposit MAU** | Distinct wallets that performed at least one fiat top-up or crypto deposit in a calendar month. |
| **Withdrawal MAU** | Distinct wallets that performed at least one fiat off-ramp or crypto withdrawal in a calendar month. |
| **Cashback MAU** | Distinct wallets that received at least one GNO cashback reward in a calendar month. |
| **ARPU (Avg Revenue Per User)** | Total payment volume (USD) ÷ Payment MAU for a given month. Measures average card spending per paying wallet — not Gnosis Pay platform revenue. |
| **Repeat Purchase Rate** | Percentage of paying wallets that made 2 or more card payments within a calendar month. Formula: (wallets with 2+ payments ÷ total paying wallets) × 100. |
| **Churn Rate** | Percentage of users active in the current month who are not active the following month. Formula: (churned users ÷ total active users) × 100. Tracked separately for "Payment only" and "Any activity" scopes. |
| **Retention Rate** | Percentage of the previous month's active users who remain active in the current month. Formula: (retained users ÷ previous month total active) × 100. |
| **Net Flow** | Total deposits (fiat + crypto) minus total withdrawals (fiat + crypto) in USD. |

---

## User Lifecycle Segments

| Segment | Definition |
|---------|-----------|
| **New** | Wallets in their first month of activity. |
| **Retained** | Active in both the current and previous month. |
| **Returning** | Previously active, had at least one inactive month, now active again. |
| **Churned** | Active in the current month but not in the following month. |

---

## Cohort Retention

Users are grouped by the month of their first card payment (activation cohort). Each subsequent month shows what percentage of that original cohort remains active. Tracked by both user count and payment volume.

**Reading the heatmap:**
- Each **row** is a cohort grouped by first-payment month.
- Each **column** is a calendar month.
- **%** — What percentage of the cohort was active that month.
- **#** — How many users from the cohort were active.
- **$** — Total payment volume (USD) from that cohort.

---

## Action Types

| Action | Direction | Definition |
|--------|-----------|-----------|
| **Payment** | Wallet → Merchant | Card spend at point of sale. |
| **Reversal** | Merchant → Wallet | Reversed or refunded transaction. |
| **Cashback** | Cashback contract → Wallet | GNO reward for card usage. |
| **Fiat Top Up** | Zero address → Wallet | Bank deposit via Monerium (EURe/GBPe). |
| **Fiat Off-ramp** | Wallet → Zero address | Bank withdrawal via Monerium (EURe/GBPe). |
| **Crypto Deposit** | External address → Wallet | On-chain token transfer in. |
| **Crypto Withdrawal** | Wallet → External address | On-chain token transfer out. |

---

## Wallet & Balance Concepts

| Concept | Definition |
|---------|-----------|
| **Funded Wallet** | A wallet that has made at least one card payment. Counted from the date of its first payment. This is a cumulative, monotonically increasing metric. |
| **Balance Cohorts** | Wallets grouped by their balance tier (e.g., 0–10, 10–100, 100–1K). Shows distribution of holders and value across tiers. |

---

## Cashback Program

| Concept | Definition |
|---------|-----------|
| **Cashback** | GNO tokens distributed as rewards for card usage. Paid from the Gnosis Pay cashback contract to the user's wallet. |
| **Cashback Distribution** | Percentile bands of weekly per-user GNO cashback. The median (q50) shows the typical user. Wide bands indicate concentrated rewards among a few wallets. |
| **Cashback Impact** | Comparison of payer behavior across dynamic cashback segments to measure how the rewards program influences spending and retention. |

---

## Tokens

| Token | Description |
|-------|-----------|
| **EURe** | Euro-denominated stablecoin issued by Monerium. Primary payment token for EU cardholders. |
| **GBPe** | British Pound-denominated stablecoin issued by Monerium. Primary payment token for UK cardholders. |
| **USDC.e** | Bridged USD Coin on Gnosis Chain. Alternative payment token. |
| **GNO** | Gnosis native token. Used for cashback rewards and staking. Tracked separately from payment token balances. |

---

## Flow Metrics

| Concept | Definition |
|---------|-----------|
| **Flows** | All transfers involving Gnosis Pay wallets — payments, deposits, withdrawals, cashback, and other token movements. |
| **Inflow** | Funds entering Gnosis Pay wallets (fiat top-ups, crypto deposits, cashback). |
| **Outflow** | Funds leaving Gnosis Pay wallets (payments, fiat off-ramps, crypto withdrawals). |
| **Counterparty Label** | Classification of the other party in a transfer (e.g., Merchant, Monerium, External Wallet, Cashback Contract). |

`
};

export default metric;
