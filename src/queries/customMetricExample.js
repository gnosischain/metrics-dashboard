/**
 * Custom Metric Example
 * 
 * This is an example of how to create a custom metric with tab and size properties.
 */

const customMetricExample = {
    id: 'customMetricExample',
    name: 'Custom Metric',
    description: 'An example of a custom metric with tab and size',
    format: 'formatNumber',
    chartType: 'bar',
    color: '#34A853',
    
    // Specify which tab this metric should appear in
    tab: '04 - ESG',
    
    // Specify the size of this metric in the grid
    // Options: 'small', 'medium', 'large', 'full'
    size: 'small',
    
    // ClickHouse query
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
  
  export default customMetricExample;