const metric = {
  id: 'api_execution_gnosis_app_gpay_topups_weekly_chart',
  name: 'TopUps (weekly)',
  description: 'Weekly count and USD volume',
  metricDescription: `**Gnosis Pay top-ups per week.** Monday-aligned weekly count (\`n_topups\`) and USD volume (\`volume_usd\`) of top-ups; toggle between Count and Volume (USD). A **top-up** is a Gnosis Pay "Crypto Deposit" into a wallet currently owned by a Gnosis App user, counted from the GA launch (2025-11-12) onward. The current, still-incomplete week is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'n_topups',
  format: 'formatNumber',
  valueModeOptions: [
    { key: 'n_topups',   label: 'Count',        valueField: 'n_topups',   format: 'formatNumber' },
    { key: 'volume_usd', label: 'Volume (USD)', valueField: 'volume_usd', format: 'formatCurrency' },
  ],
  defaultValueMode: 'n_topups',
  query: `
    SELECT toDate(week) AS date, n_topups, volume_usd
    FROM dbt.api_execution_gnosis_app_gpay_topups_weekly
    ORDER BY date ASC
  `,
};
export default metric;
