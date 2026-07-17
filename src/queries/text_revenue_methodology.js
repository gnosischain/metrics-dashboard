const metric = {
  id: 'text_revenue_methodology',
  name: 'Methodology — Revenue Drivers',
  description: 'Assumptions, data flow, and how active users are computed across sectors. Values are potential (imputed) revenue drivers, not recognized DAO revenue.',
  chartType: 'text',
  content: `
## Goal

Track on-chain revenue streams that can accrue value to the **Gnosis DAO**, at
per-user resolution, and roll them up into weekly and monthly views.
Revenue is attributed to a user only while they hold / use the underlying
asset, and the "Active Users" headline de-duplicates the same user across
streams.

---

## Streams & assumptions

Each sector is computed independently at (date, user, symbol) grain. Rates /
fees are declared as constants at the top of each dbt model so they can be
re-tuned without restructuring the pipeline.

| Sector | Formula (per day, per user) | Rate / fee | Assets covered |
|---|---|---|---|
| **Holdings — EURe** | \`balance_usd × 9.6e-6\` | 0.351% APY | EURe (native) + aGnoEURe (Aave V3) |
| **Holdings — USDC.e** | \`balance_usd × 9.6e-6\` | 0.351% APY | USDC.e (native) + aGnoUSDCe (Aave V3) |
| **Holdings — BRLA** | \`balance_usd × 5.61349e-5\` | 2.07% APY | BRLA (native) |
| **Holdings — ZCHF** | \`balance_usd × 1.36646e-5\` | 0.5% APY | ZCHF + svZCHF (native) |
| **sDAI** | \`balance_usd × sdai_daily_rate × 10%\` | 10% of the on-chain sDAI rate | sDAI (native) + aGnosDAI (Aave V3) |
| **Gnosis Pay — EURe / GBPe** | \`transfer_amount × 20 bps × price_usd\` | 0.20% of each payment | EURe / GBPe transfers to \`0x4822…172EE\` |
| **Gnosis Pay — USDC.e** | \`transfer_amount × 100 bps × price_usd\` | 1.00% of each payment | USDC.e transfers to \`0x4822…172EE\` |

**Notes**

- "Holdings" rates are **imputed interest** a user's balance could earn — the
  DAO share is *potential*, not realized. Final policy share may differ.
- sDAI "10%" is the DAO's assumed cut of the full sDAI yield rate.
- Gnosis Pay bps are the real per-transaction fee; the settlement address is
  the Gnosis Pay spender contract.
- SparkLend is **not** included; only Aave V3 aTokens are treated as
  lending-pool holdings.
- Old EURe / GBPe contracts retire on **2024-08-25** — both the old and new
  contract addresses are covered via the \`tokens_whitelist\` seed.

---

## End-to-end data flow

\`\`\`mermaid
flowchart LR
  S[on-chain sources] --> D[daily per-user fees<br/>per stream & token]
  D --> W[weekly per-user<br/>+ rolling 52w]
  D --> M[monthly per-user]
  W --> PT[per-token cohort marts]
  M --> PT
  W --> AU[Active Users totals<br/>cross-stream]
  M --> AU
\`\`\`

---

## Weekly rolling — dense calendar + 52-week trailing sum

\`\`\`mermaid
flowchart LR
  A[daily fees] --> B[sparse weekly sums]
  B --> C[dense per-user calendar<br/>missing weeks → 0]
  C --> D["rolling 52w SUM<br/>→ annual_rolling_fees"]
\`\`\`

**Why dense?** \`ROWS 51 PRECEDING\` counts *rows*, not calendar weeks. On a
sparse series a user who held briefly two years ago then stopped would still
have their ancient fees in the trailing window. Filling zero-weeks turns the
window into a true 52-calendar-week trailing sum.

---

## Monthly — calendar month (not a window)

\`\`\`mermaid
flowchart LR
  A[daily rows] --> B["group by<br/>toStartOfMonth(date), user, stream, symbol"]
  B --> C["month_fees = SUM(fees)"]
  C --> D[drop the current incomplete month]
\`\`\`

The monthly view is **not** an aggregation of the weekly view — it's an
independent per-month sum with scaled cohort thresholds. A user at
\`\\$0.50 / month\` sits at roughly the \`\\$6 / year\` weekly bucket
(\`6 ÷ 12 ≈ 0.5\`), so the two views answer complementary questions:

| View | Answers |
|---|---|
| Weekly (rolling 52w, ≥ \\$6) | Where is the **ongoing** user distribution? |
| Monthly (≥ \\$0.50) | Who was **actively** paying this month? |

---

## Active Users — cross-stream dedup

This is the headline metric. A user is counted **once** regardless of how
many sectors they qualify in.

\`\`\`mermaid
flowchart TD
  H[holdings weekly fees<br/>per user × 4 symbols]
  S[sDAI weekly fees<br/>per user]
  G[gpay weekly fees<br/>per user × 3 symbols]

  H --> SUM
  S --> SUM
  G --> SUM
  SUM[SUM fees ACROSS all streams/symbols<br/>→ one number per user per week]

  SUM --> THR["apply threshold:<br/>≥ \\$6 rolling 52w · OR · ≥ \\$0.50 monthly"]
  THR --> CNT["countDistinct(user) per period"]
  CNT --> OUT[Active Users bar]

  style SUM fill:#ffe,stroke:#aa3
  style THR fill:#fdd,stroke:#a33
\`\`\`

**Key invariant.** Summing *before* thresholding is what guarantees no
double-counting: a user who is \\$3/yr in holdings and \\$4/yr in GPay counts
once at \\$7 (crosses the \\$6 line) — they do **not** count twice at \\$3
and \\$4 (both of which would fail the per-stream \\$6 threshold on their own).

The weekly chart adds horizontal milestone lines at
**125K / 250K / 500K / 1M** active users so progress against DAO growth
targets is visible at a glance.

---

## Caveats

- **Coverage depends on identifiable on-chain events.** Transfers between a
  Safe and its module, or swaps routed through aggregators, may not be
  captured if the balance source doesn't reflect them.
- **Potential vs realized.** Holdings and sDAI fees represent a hypothetical
  share the DAO *could* accrue at the stated rates — not dollars already
  collected.
- **Small-balance truncation.** The weekly mart drops users whose trailing
  52-week total *and* current week are both zero. Users with a single
  micro-balance event that rounds to zero in the rolling window are
  therefore excluded by design.
- **Token cut-overs.** When a stablecoin contract is replaced (EURe / GBPe
  on 2024-08-25), both addresses are read via the tokens_whitelist seed so
  continuity is preserved.
`
};

export default metric;
