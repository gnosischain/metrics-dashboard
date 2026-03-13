const metric = {
  id: 'api_execution_yields_overview_lending_tvl',
  name: 'Lending TVL',
  description: 'Aave V3 total deposits',
  metricDescription: 'Total value locked across all Aave V3 lending reserves on Gnosis Chain. Change compares to 7 days ago.',
  format: 'formatValue',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 7 days ago'
  },
  query: `SELECT value, change_pct FROM dbt.api_execution_yields_overview_lending_tvl`,
};

export default metric;
