const metric = {
  id: 'overview_yields_lending_tvl',
  name: 'Lending TVL',
  valueField: 'value',
  chartType: 'number',
  format: null,
  fontSize: '2.6rem',
  query: `SELECT CONCAT('+$',toString(floor(value/1000000)), 'M') AS value FROM dbt.api_execution_yields_overview_lending_tvl`
};

export default metric;
