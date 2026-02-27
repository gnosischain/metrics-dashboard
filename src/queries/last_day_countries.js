const metric = {
  id: 'last_day_countries',
  name: 'Countries',
  format: 'formatNumber',
  chartType: 'numberDisplay',
  color: '#4F46E5',
  query: `SELECT COUNT(DISTINCT country) AS value FROM dbt.p2p_peers_geo_latest`
};

export default metric;
