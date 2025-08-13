const metric = {
  id: 'last_day_nodes',
  name: 'Nodes',
  format: 'formatNumber',
  chartType: 'numberDisplay',
  showSubtitle: true,
  color: '#0969DA',
  query: `SELECT SUM(cnt) AS value FROM dbt.p2p_peers_geo_latest`
};

export default metric;