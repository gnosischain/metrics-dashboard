const metric = {
  id: 'api_execution_gnosis_app_swap_fees_weekly',
  name: 'Swap Fees',
  description: 'Protocol fees from filled CoW swaps',
  metricDescription: 'Weekly CoW protocol fee revenue from filled Gnosis App swaps. fee_usd is pro-rated from fee_amount (sold-token native units) via amount_sold/amount_usd. Toggle units to flip between USD volume, USD fees, and fee % of volume.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrency',
  xField: 'week',
  yField: 'fee_usd_total',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  unitFields: {
    fee_usd:    { field: 'fee_usd_total',    format: 'formatCurrency' },
    volume_usd: { field: 'volume_usd',       format: 'formatCurrency' },
    fee_pct:    { field: 'fee_pct_of_volume', format: 'formatNumber' },
    n_swaps:    { field: 'n_filled_swaps',   format: 'formatNumber' },
  },
  query: `
    SELECT week, n_filled_swaps, volume_usd, fee_usd_total, fee_pct_of_volume
    FROM dbt.api_execution_gnosis_app_swap_fees_weekly
    ORDER BY week
  `,
};
export default metric;
