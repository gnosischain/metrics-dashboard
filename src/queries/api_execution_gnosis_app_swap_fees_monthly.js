const metric = {
  id: 'api_execution_gnosis_app_swap_fees_monthly',
  name: 'Swap Fees',
  description: 'Protocol fees from filled CoW swaps',
  metricDescription: 'Monthly CoW protocol fee revenue from filled Gnosis App swaps.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrency',
  xField: 'month',
  yField: 'fee_usd_total',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  query: `
    SELECT month, n_filled_swaps, volume_usd, fee_usd_total, fee_pct_of_volume
    FROM dbt.api_execution_gnosis_app_swap_fees_monthly
    ORDER BY month
  `,
};
export default metric;
