const metric = {
  id: 'api_execution_state_full_size_daily',
  name: 'EL State Growth',
  description: 'Daily growth of the execution state size (GB)',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  // Default zoom configuration
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
  
  query: `SELECT * FROM dbt.api_execution_state_full_size_daily`,
};

export default metric;