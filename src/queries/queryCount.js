/**
 * Query Count Metric Definition
 * 
 * This metric counts the number of queries executed in ClickHouse per day.
 */

const queryCount = {
    id: 'queryCount',
    name: 'Query Count',
    description: 'Number of queries executed',
    format: 'formatNumber',
    chartType: 'line',
    color: '#4285F4',
    query: `
      SELECT 
        toDate(event_time) AS date, 
        count() AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'QueryStart'
      GROUP BY date
      ORDER BY date
    `
  };
  
  export default queryCount;