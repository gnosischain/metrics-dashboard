const metric = {
  id: 'api_execution_gnosis_app_swaps_weekly_chart',
  name: 'Swaps',
  description: 'Weekly count and filled USD volume',
  metricDescription: 'Weekly Gnosis App CoW swap signings and filled USD volume.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'n_swaps',
  format: 'formatNumber',
  valueModeOptions: [
    { key: 'n_swaps',           label: 'Signed Orders', valueField: 'n_swaps',           format: 'formatNumber' },
    { key: 'volume_usd_filled', label: 'Volume (USD)',  valueField: 'volume_usd_filled', format: 'formatCurrency' },
  ],
  defaultValueMode: 'n_swaps',
  query: `
    SELECT toDate(week) AS date, n_swaps, volume_usd_filled
    FROM dbt.api_execution_gnosis_app_swaps_weekly
    ORDER BY date ASC
  `,
};
export default metric;
