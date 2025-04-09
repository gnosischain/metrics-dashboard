/**
 * Client Distribution Metric Definition
 */
const metric = {
  id: '02_execution_1000',
  name: 'Client Distribution',
  description: 'Distribution of block production per client',
  format: 'formatNumber',
  labelField: 'client',
  valueField: 'value',
  chartType: 'stackedBar',
  tab: '02 - Execution',
  query: `SELECT * FROM dbt.execution_blocks_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;