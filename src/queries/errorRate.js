/**
 * Error Rate Metric Definition
 * 
 * This metric calculates the percentage of failed queries.
 */

const errorRate = {
    id: 'errorRate',
    name: 'Error Rate',
    description: 'Percentage of failed queries',
    format: 'formatPercentage',
    chartType: 'line',
    color: '#EA4335',
    query: `
      SELECT 
        toDate(event_time) AS date, 
        countIf(exception != '') * 100 / count() AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'ExceptionWhileProcessing'
      GROUP BY date
      ORDER BY date
    `
  };
  
  export default errorRate;