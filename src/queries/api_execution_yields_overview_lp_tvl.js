const metric = {
  id: 'api_execution_yields_overview_lp_tvl',
  name: 'LP TVL',
  description: 'Across all pools',
  metricDescription: 'Total value locked across all tracked Uniswap V3 and Swapr V3 liquidity pools. Change compares to 7 days ago.',
  format: 'formatValue',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  query: `SELECT value, change_pct FROM dbt.api_execution_yields_overview_lp_tvl`,
};

export default metric;
