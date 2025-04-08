/**
 * Custom Metric Example
 * 
 * This is an example of how to create a custom metric with tab and size properties.
 */

const metric = {
    id: '01_network_1000',
    name: 'Test Metric',
    description: 'An example of a custom metric with tab and size',
    format: 'formatNumber',
    chartType: 'bar',
    color: '#34A853',
    tab: '01 - Network',
    size: 'small',
    vSize: 'large',
    
    query: `
      SELECT 
        toDate(event_time) AS date, 
        count() AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
      GROUP BY date
      ORDER BY date
    `
  };
  
  export default metric;