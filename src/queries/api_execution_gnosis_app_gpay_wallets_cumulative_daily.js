const metric = {
  id: 'api_execution_gnosis_app_gpay_wallets_cumulative_daily',
  name: 'GP Wallets on Gnosis App',
  description: 'Daily cumulative by onboarding class',
  metricDescription: `Cumulative count of Gnosis Pay cards that have ever gained a Gnosis App (GA) owner, plotted daily and split by \`onboarding_class\`. \`onboarded_via_ga\` = the FIRST owner module enabled on the card's Gnosis Pay Safe was a GA-user address (the card came into GP through the app); \`imported\` = any other first-owner case, i.e. a GA Safe was added as owner after the card already existed. A June-2026-migrated pair (old Safe plus its canonical new Safe) is collapsed to ONE canonical card to avoid double-counting. Value is the running total (\`n_ga_wallets_cumulative\`); the current incomplete day is excluded. Grain: daily, unit is card count.`,
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  format: 'formatNumber',
  query: `
    SELECT toDate(date) AS date,
           onboarding_class AS label,
           n_ga_wallets_cumulative AS value
    FROM dbt.api_execution_gnosis_app_gpay_wallets_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
