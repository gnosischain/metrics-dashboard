/**
 * Error Rate Metric Definition
 * 
 * This metric measures the percentage of queries that result in errors.
 */

const errorRate = {
    id: 'errorRate',
    name: 'Query Error Rate',
    description: 'Percentage of queries resulting in errors',
    format: 'formatPercentage',
    chartType: 'line',
    color: '#EA4335',
    tab: '99 - Tests',
    size: 'full',
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