const metric = {
  id: 'historical_state_growth',
  name: 'EL State Growth',
  description: 'Daily growth of the execution state size (GB)',
  format: 'formatNumber',
  chartType: 'area',
  fill: true,
  showPoints: false, 
  color: '#769689',
  query: `SELECT date, bytes/POWER(10,9) AS value FROM dbt.execution_state_size_daily ORDER BY date`
};

export default metric;