const metric = {
  id: 'overview_yields_lending_tvl',
  name: 'Lending TVL',
  valueField: 'value',
  chartType: 'number',
  format: 'formatCurrencyCompact',
  metricDescription: 'Total value locked across lending markets on Gnosis Chain.',
  query: `SELECT value FROM dbt.api_execution_yields_overview_lending_tvl`
};

export default metric;
