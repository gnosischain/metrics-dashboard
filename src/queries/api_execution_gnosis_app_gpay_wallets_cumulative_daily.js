const metric = {
  id: 'api_execution_gnosis_app_gpay_wallets_cumulative_daily',
  name: 'GP Wallets on Gnosis App',
  description: 'Daily cumulative by onboarding class',
  metricDescription: 'Cumulative count of Gnosis Pay wallets that have gained a Gnosis App owner, split by onboarding class. "onboarded_via_ga" — the very first owner was a GA user (zero → GP via the app). "imported" — a GA Safe was added as owner after creation.',
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
