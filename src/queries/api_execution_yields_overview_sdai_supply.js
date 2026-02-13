const metric = {
  id: 'api_execution_yields_overview_sdai_supply',
  name: 'sDAI Supply',
  description: 'Total sDAI supply on Gnosis Chain',
  format: 'formatValue',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  query: `SELECT value, change_pct FROM dbt.api_execution_yields_overview_sdai_supply`,
};

export default metric;
