const metric = {
id: 'historical_nodes_geo',
name: 'Geo Distribution',
description: 'Distribution of peers per country across the network',
format: 'formatNumber',
labelField: 'country',
valueField: 'cnt',
chartType: 'stackedBar',
query: `SELECT * FROM dbt.p2p_peers_geo_daily ORDER BY date ASC, country ASC`,
};

export default metric;