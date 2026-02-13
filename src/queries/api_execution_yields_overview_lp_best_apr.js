const metric = {
  id: 'api_execution_yields_overview_lp_best_apr',
  name: 'Top Pool APR',
  description: 'Best 7D fee yield among LP pools',
  format: 'formatPercentage',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  labelData: {
    enabled: true,
    field: 'label',
    prefix: ''
  },
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  query: `SELECT value, change_pct, label FROM dbt.api_execution_yields_overview_lp_best_apr`,
};

export default metric;
