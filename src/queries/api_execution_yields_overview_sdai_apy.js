const metric = {
  id: 'api_execution_yields_overview_sdai_apy',
  name: 'Savings xDAI APY',
  description: 'Current',
  metricDescription:
    'Current annual percentage yield on the Savings xDAI vault on Gnosis Chain. ' +
    'Before 2025-11-07 this reflected the Sky DSR relayed via the xDAI bridge; ' +
    'after the bridge upgrade it reflects the sUSDS savings rate. Comparison is ' +
    'vs 7 days ago so short-term changes are visible across the regime change.',
  format: 'formatPercentage',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  query: `SELECT value, change_pct FROM dbt.api_execution_yields_overview_sdai_apy`,
};

export default metric;
