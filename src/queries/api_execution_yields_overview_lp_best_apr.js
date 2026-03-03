const metric = {
  id: 'api_execution_yields_overview_lp_best_apr',
  name: 'Top Pool APR',
  description: 'Best 7D fee yield',
  metricDescription: 'Highest 7-day trailing fee APR among tracked Uniswap V3 and Swapr V3 pools. Annualised from recent fee revenue relative to pool TVL.',
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
