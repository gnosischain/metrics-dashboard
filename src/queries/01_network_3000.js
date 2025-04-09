/**
 * Client Distribution Metric Definition
 */
const metric = {
  id: '01_network_3000',
  name: 'Client Distribution',
  description: 'Distribution of client implementations across the network',
  format: 'formatNumber',
  chartType: 'stackedBar', // Options: 'line', 'bar', 'stackedBar'
  tab: '01 - Network',
  query: `SELECT * FROM dbt.p2p_peers_clients_daily ORDER BY date ASC`
};

export default metric;