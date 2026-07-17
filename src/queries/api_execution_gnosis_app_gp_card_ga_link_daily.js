const metric = {
  id: 'api_execution_gnosis_app_gp_card_ga_link_daily',
  name: 'GA-linked GP cards',
  description: 'Daily cumulative GA↔GP-card links by signal',
  metricDescription: `Cumulative count of Gnosis Pay cards **linked to a Gnosis App (GA) account**, plotted daily and stacked by the signal that established the link. Unlike the frozen "GP Wallets on Gnosis App" chart above — which relies on the on-chain **DelayModule** owner event and therefore plateaus after the June-2026 RolesModule migration — this series is **module-agnostic** and keeps growing.

Each card is counted once under its highest-precedence signal:
- **App profile (Mixpanel)** — the app's own record (\`pay\` profile property) of which GA account controls this Gnosis Pay Safe. App-truth, works for post-migration cards.
- **Delay module (legacy)** — the pre-migration on-chain GA-owner (carried onto the card's June-2026 canonical Safe).
- **Top-up funder** — a GA account funded this card via a Cometh-relayed top-up.
- **Cashback** — the cashback-NFT owner is a registered GA account.

**This is a LINK, not the onboarding class.** It answers "a GA account controls/funds this card," NOT the old \`onboarded_via_ga\` vs \`imported\` split — that classification is on-chain unrecoverable for post-migration cards (0 of 68,680 RolesModule owners and 0 of 34,340 Safe-setup owners are GA users). Note the Mixpanel signal is a current-state snapshot (app-side ingestion) and coverage is bounded to app users whose profile recorded a pay Safe.

**The trailing ~2 weeks are provisional.** Cards are dated at their creation, but a card only counts once its GA link is *recorded* — the app writes the Mixpanel \`pay\` link (or a GA account tops the card up) only after the user finishes activating it, which lags creation by days to ~2 weeks. So the most recent dates are under-counted and **fill in retroactively** as links form; a flat edge is this lag, not a halt in onboarding. Grain: daily; unit is card count; the current incomplete day is excluded.

**Scope:** counts GA-linked cards on the payment-gated "active cardholder" basis (a card counts once it has transacted), the same basis as the funding/spend metrics — deployed-but-never-spent GP cards are excluded here (the platform-wide "deployed Gnosis Pay accounts" metric counts those).`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  seriesColorsByName: {
    'App profile (Mixpanel)': '#7B3FE4',
    'Delay module (legacy)': '#4C1D95',
    'Top-up funder': '#FF8A3D',
    Cashback: '#F59E0B',
  },
  format: 'formatNumber',
  query: `
    SELECT toDate(date) AS date,
           multiIf(link_source = 'mixpanel_pay', 'App profile (Mixpanel)',
                   link_source = 'delay_module', 'Delay module (legacy)',
                   link_source = 'topup_funder', 'Top-up funder',
                   link_source = 'cashback',     'Cashback',
                   link_source) AS label,
           n_cards_cumulative AS value
    FROM dbt.api_execution_gnosis_app_gp_card_ga_link_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
