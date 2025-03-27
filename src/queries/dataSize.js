/**
 * Data Size Metric Definition
 * 
 * This metric measures the amount of data processed by queries in bytes.
 */

const dataSize = {
    id: 'dataSize',
    name: 'Data Processed',
    description: 'Amount of data processed by queries',
    format: 'formatBytes',
    chartType: 'line',
    color: '#34A853',
    query: `
      SELECT 
        toDate(event_time) AS date, 
        sum(read_bytes) AS value
      FROM system.query_log
      WHERE type = 'QueryFinish'
      GROUP BY date
      ORDER BY date
    `
  };
  
  export default dataSize;