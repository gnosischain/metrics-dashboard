/**
 * Client Distribution Metric Definition
 */
const metric_001 = {
  id: 'metric_001',
  name: 'Client Distribution',
  description: 'Distribution of client implementations across the network',
  format: 'formatNumber',
  chartType: 'stackedBar', // Options: 'line', 'bar', 'stackedBar'
  tab: 'Network',
  size: 'full',
  color: [
    '#4285F4', // Lighthouse - Blue
    '#34A853', // Teku - Green
    '#FBBC05', // Lodestar - Yellow
    '#EA4335', // Nimbus - Red
    '#8AB4F8', // Erigon - Light Blue
    '#A0A0A0'  // Unknown - Gray
  ],
  query: `SELECT * FROM dbt.p2p_gnosis_peers_clients_daily`
};

export default metric_001;