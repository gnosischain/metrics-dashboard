const metric = {
  id: 'api_execution_stablecoins_supply_total',
  name: 'Total Stablecoin Supply',
  format: 'formatNumber',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'compact',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'from 7d ago'
  },
  query: `SELECT * FROM dbt.api_execution_stablecoins_supply_total`,
};

export default metric;

