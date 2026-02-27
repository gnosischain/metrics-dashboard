const metric = {
  id: 'api_esg_carbon_emissions_daily',
  name: 'Network CO2 Emissions',
  description: 'Daily kgCO2 emissions from the network',
  metricDescription: 'Daily network CO2e estimate with uncertainty bands from model simulations. The central line is the smoothed estimate and bands show confidence bounds.',
  chartType: 'quantileBands', 
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',

  defaultZoom: {
    start: 80, 
    end: 100   
  },
  
  // QuantileBands specific configuration
  xField: 'date',
  
  // Band configuration - array of objects defining bands
  bands: [
    { lower: 'ma7_lower_95', upper: 'ma7_upper_95', opacity: 0.15, name: '90% Range (5%-95%)' },
    { lower: 'ma7_lower_90', upper: 'ma7_upper_90', opacity: 0.25, name: '80% Range (10%-90%)' }
  ],
  
  // Line configuration - array of field names to draw as lines
  lines: ['ma7_value'], 
  
  // Visual configuration
  lineOpacity: 0.9,
  lineStrokeWidth: 3,
  interpolate: 'monotoneX',
  
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
  
  // Example query that returns quantile data
  query: `
    SELECT * FROM api_esg_carbon_emissions_daily
  `
};

export default metric;