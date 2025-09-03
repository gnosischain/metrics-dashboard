const metric = {
  id: 'api_esg_estimated_nodes_daily',
  name: 'Nodes Estimations',
  description: 'Daily estimations of nodes in network',
  chartType: 'quantileBands', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',

  defaultZoom: {
    start: 80, 
    end: 100   
  },
  
  // QuantileBands specific configuration
  xField: 'date',
  
  // Band configuration - array of objects defining bands
  bands: [
    { lower: 'nodes_lower_95', upper: 'nodes_upper_95', opacity: 0.25, name: 'cl. 95%' }
  ],
  
  // Line configuration - array of field names to draw as lines
  lines: ['baseline_observed_nodes', 'estimated_nodes'], 
  
  // Visual configuration
  lineOpacity: 0.9,
  lineStrokeWidth: 3,
  interpolate: 'linear',
  
  // Custom colors for bands (optional)
  bandColors: ['#4dabf7', '#69db7c', '#ffd43b'],
  
  // Custom colors for lines (optional)  
  lineColors: ['#000000','#004525ff'], // Black median line
  
  // Legend and interaction
  enableLegend: true,
  enableTooltip: true,
  legendPosition: 'top',
  legendScrollable: true,
  

  // Universal watermark configuration
  showWatermark: true,
  watermarkPosition: 'bottom-right',
  watermarkSize: 25,
  watermarkOpacity: 0.3,
  
  labelField: 'label',
  enableFiltering: true, 

  // Example query that returns quantile data
  query: `
    SELECT * FROM dbt.api_esg_estimated_nodes_daily
  `
};

export default metric;