const metric = {
  id: 'api_execution_yields_overview_lending_best_apy',
  name: 'Top Lending APY',
  description: 'Best supply APY on Aave V3',
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
  query: `SELECT value, change_pct, label FROM dbt.api_execution_yields_overview_lending_best_apy`,
};

export default metric;
