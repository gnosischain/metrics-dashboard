const metric = {
  id: 'api_execution_yields_overview_sdai_apy',
  name: 'sDAI Yield',
  description: 'Current sDAI yield',
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
