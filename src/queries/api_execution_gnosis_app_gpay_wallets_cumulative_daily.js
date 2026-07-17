const metric = {
  id: 'api_execution_gnosis_app_gpay_wallets_cumulative_daily',
  name: 'GP Wallets on Gnosis App',
  description: 'Daily cumulative by onboarding class',
  metricDescription: `Cumulative count of Gnosis Pay cards that have ever gained a Gnosis App (GA) owner, plotted daily and split by \`onboarding_class\`. \`onboarded_via_ga\` = the FIRST owner module enabled on the card's Gnosis Pay Safe was a GA-user address (the card came into GP through the app); \`imported\` = any other first-owner case, i.e. a GA Safe was added as owner after the card already existed. A June-2026-migrated pair (old Safe plus its canonical new Safe) is collapsed to ONE canonical card to avoid double-counting. Value is the running total (\`n_ga_wallets_cumulative\`); the current incomplete day is excluded. Grain: daily, unit is card count.

**Why it plateaus after ~June 5, 2026 — and why that is mostly correct.** This split is derived only from the on-chain **DelayModule** owner event, which the June-2026 post-exploit migration to a **RolesModule** architecture stopped emitting per user. Two things follow. (1) The plateau is largely accurate: of the ~34k post-migration cards, **~97% are migrated existing cards** (a card's new canonical Safe) that were already counted here at their original onboarding date — the migration *moved* cards, it did not create new GA onboarding. Only ~1k are genuinely net-new. (2) The onboarded-via-GA / imported **classification cannot be extended** to net-new post-migration cards: the human GA user appears in **no** on-chain field (0 of 68,680 RolesModule owners and 0 of 34,340 Safe-setup owners are GA users). For a **module-agnostic GA↔GP-card link** that does keep growing (from the app's Mixpanel profile plus on-chain funding/cashback signals), see **"GA-linked GP cards"** below — note it is a *link*, not this first-owner class.`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  seriesColorsByName: { 'Onboarded via GA': '#7B3FE4', Imported: '#FF8A3D' },
  format: 'formatNumber',
  query: `
    SELECT toDate(date) AS date,
           multiIf(onboarding_class = 'onboarded_via_ga', 'Onboarded via GA', 'Imported') AS label,
           n_ga_wallets_cumulative AS value
    FROM dbt.api_execution_gnosis_app_gpay_wallets_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
