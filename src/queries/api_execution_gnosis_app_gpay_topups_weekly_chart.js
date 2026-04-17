const metric = {
  id: 'api_execution_gnosis_app_gpay_topups_weekly_chart',
  name: 'TopUps',
  description: 'Weekly count and USD volume',
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
