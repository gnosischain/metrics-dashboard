const metric = {
  id: 'historical_state_growth',
  name: 'EL State Growth',
  description: 'Daily growth of the execution state size (GB)',
  chartType: 'd3Area',
  isTimeSeries: true,
  enableZoom: true,
  
  d3Config: {
    // Field mappings - make sure these match your data structure
    xField: 'date',
    yField: 'value',
    
    multiSeries: false,
    opacity: 0.8,
    strokeWidth: 2, 
    interpolate: 'monotoneX',
    
    // Visual settings
    enableLegend: false,
    enableTooltip: true,

    // Points configuration
    showPoints: true,        // Show data points
    pointRadius: 2,          // Small point radius for clean look
    
  },
  query: `SELECT date, bytes/POWER(10,9) AS value FROM dbt.execution_state_size_daily ORDER BY date`,
};

export default metric;
