const metric = {
  id: 'historical_state_growth',
  name: 'EL State Growth',
  description: 'Daily growth of the execution state size (GB)',
  chartType: 'area', // Changed from 'd3Area' to 'area'
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  // NEW: Default zoom configuration
  defaultZoom: {
    start: 70, // Start at 70% (showing last 30%)
    end: 100   // End at 100%
  },
  
  // ECharts-compatible field configuration
  xField: 'date',
  yField: 'value',
  // No seriesField since this is a single area chart
  
  // Area chart specific styling
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.4, // Slightly lower opacity for single area
  
  // No showTotal needed since it's a single series
  
  query: `SELECT date, bytes/POWER(10,9) AS value FROM dbt.execution_state_size_daily ORDER BY date`,
};

export default metric;