const metric = {
  id: 'api_execution_yields_pools_lps_count_7d',
  name: 'LPs',
  description: 'Last 7 days',
  metricDescription: 'Unique wallet addresses that provided liquidity (Mint events) on Uniswap V3 or Swapr V3 pools in the last 7 days. Change compares to the prior 7-day window.',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: true,
  labelField: 'token',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs prior 7 days'
  },
  query: `SELECT * FROM dbt.api_execution_yields_pools_lps_count_7d`,
};

export default metric;
