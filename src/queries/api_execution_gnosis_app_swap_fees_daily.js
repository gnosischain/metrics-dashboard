const metric = {
  id: 'api_execution_gnosis_app_swap_fees_daily',
  name: 'Swap Fees',
  description: 'Protocol fees from filled CoW swaps',
  metricDescription: 'Daily CoW protocol fee revenue from filled Gnosis App swaps.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrency',
  xField: 'date',
  yField: 'fee_usd_total',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  query: `
    SELECT date, n_filled_swaps, volume_usd, fee_usd_total, fee_pct_of_volume
    FROM dbt.api_execution_gnosis_app_swap_fees_daily
    ORDER BY date
  `,
};
export default metric;
