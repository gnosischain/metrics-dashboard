/**
 * Client Distribution Metric Definition
 */
const metric = {
  id: '01_network_4000',
  name: 'Geo Distribution',
  description: 'Distribution of peers per country across the network',
  format: 'formatNumber',
  labelField: 'country',
  valueField: 'cnt',
  chartType: 'stackedBar',
  tab: '01 - Network',
  size: 'full',
  vSize: 'large',
  query: `SELECT * FROM dbt.p2p_gnosis_peers_geo_daily ORDER BY date ASC, country ASC`,
};

export default metric;