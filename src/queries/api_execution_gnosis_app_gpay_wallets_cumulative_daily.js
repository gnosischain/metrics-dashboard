const metric = {
  id: 'api_execution_gnosis_app_gpay_wallets_cumulative_daily',
  name: 'GP Wallets on Gnosis App',
  description: 'Daily cumulative by onboarding class',
  metricDescription: `Cumulative count of Gnosis Pay cards that have ever gained a Gnosis App (GA) owner, plotted daily and split by \`onboarding_class\`. \`onboarded_via_ga\` = the FIRST owner module enabled on the card's Gnosis Pay Safe was a GA-user address (the card came into GP through the app); \`imported\` = any other first-owner case, i.e. a GA Safe was added as owner after the card already existed. A June-2026-migrated pair (old Safe plus its canonical new Safe) is collapsed to ONE canonical card to avoid double-counting. Value is the running total (\`n_ga_wallets_cumulative\`); the current incomplete day is excluded. Grain: daily, unit is card count.

**Measurement limit after ~June 5, 2026:** this split only covers cards onboarded under the old DelayModule architecture, where the GA-user owner was recorded on-chain and detectable. The June-2026 post-exploit migration switched Gnosis Pay to a RolesModule architecture in which every card delegates to a single shared GP controller (0x896a695d…) and the GA-user↔card link is no longer on-chain — so the onboarded-via-GA / imported split cannot be extended to post-migration cards. The plateau from ~June 5 is this data-availability limit, not a halt in onboarding (post-migration cards are real and transacting: ~34k new cards, ~24% already paying).`,
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
