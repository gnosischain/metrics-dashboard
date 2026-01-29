const metric = {
  id: 'api_execution_yields_overview_lp_tvl',
  name: 'Total LP TVL',
  description: 'Total TVL across all LP pools, in USD',
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
