const metric = {
  id: 'last_day_nodes',
  name: 'Nodes',
  description: 'Last day',
  format: 'formatNumber',
  chartType: 'numberDisplay',
  color: '#0969DA',
  query: `SELECT SUM(cnt) AS value FROM dbt.p2p_peers_geo_latest`
};

export default metric;