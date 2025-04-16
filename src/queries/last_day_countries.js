const metric = {
  id: 'last_day_countries',
  name: 'Countries',
  description: 'Last day',
  format: 'formatNumber',
  chartType: 'numberDisplay',
  color: '#34A853',
  query: `SELECT COUNT(DISTINCT country) AS value FROM dbt.p2p_peers_geo_latest`
};

export default metric;