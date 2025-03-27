/**
 * Query Duration Metric Definition
 * 
 * This metric measures the average query execution time in seconds.
 */

const queryDuration = {
    id: 'queryDuration',
    name: 'Average Query Time',
    description: 'Average query execution time',
    format: 'formatDuration',
    chartType: 'line',
    color: '#FBBC05',
    query: `
      SELECT 
        toDate(event_time) AS date, 
        avg(query_duration_ms) / 1000 AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'QueryFinish'
      GROUP BY date
      ORDER BY date
    `
  };
  
  export default queryDuration;