const metric = {
  id: 'historical_el_client_distribution',
  name: 'EL Client Distribution',
  description: 'Distribution of block production per client',
  format: 'formatNumber',
  chartType: 'area', 
  labelField: 'client', 
  valueField: 'value',
  fill: true, 
  showPoints: false, 
  stackedArea: true,
  query: `SELECT * FROM dbt.execution_blocks_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;
