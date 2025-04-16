const metric = {
  id: 'last_day_geo',
  name: 'Geo Distribution',
  description: 'Last day geografical distribution of peers in the network',
  format: 'formatNumber',
  labelField: 'country',
  valueField: 'cnt',
  chartType: 'map',
  query: `SELECT * FROM dbt.p2p_peers_geo_latest`,
};

export default metric;