/**
 * Custom Metric Example
 * 
 * This is an example of how to create a custom metric with tab and size properties.
 */

const metric = {
    id: '01_network_1000',
    name: 'Peers',
    description: 'Last day',
    format: 'formatNumber',
    chartType: 'numberDisplay',
    color: '#34A853',
    query: `SELECT SUM(cnt) AS value FROM dbt.p2p_peers_geo_latest`
  };
  
  export default metric;