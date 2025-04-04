/**
 * Client Distribution Metric Definition
 */
const metric_001 = {
  id: 'metric_001',
  name: 'Client Distribution',
  description: 'Distribution of client implementations across the network',
  format: 'formatNumber',
  chartType: 'stackedBar', // Options: 'line', 'bar', 'stackedBar'
  tab: '01 - Network',
  size: 'full',
  vSize: 'large',
  query: `SELECT * FROM dbt.p2p_gnosis_peers_clients_daily`
};

export default metric_001;