const metric = {
  id: 'historical_el_client_distribution',
  name: 'EL Client Distribution',
  description: 'Distribution of block production per client',
  format: 'formatNumber',
  labelField: 'client',
  valueField: 'value',
  chartType: 'stackedBar',
  query: `SELECT * FROM dbt.execution_blocks_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;