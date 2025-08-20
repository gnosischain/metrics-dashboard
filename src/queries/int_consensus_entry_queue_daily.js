/**
 * Example metric configuration using the new QuantileBandsChart
 * Location: src/queries/consensus/example_quantile_bands.js
 */

const metric = {
  id: 'int_consensus_entry_queue_daily',
  name: 'Balance Value Distribution',
  description: 'Daily Validators balance quantiles',
  chartType: 'quantileBands',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  defaultZoom: {
    start: 80, 
    end: 100   
  },
  
  // QuantileBands configuration
  xField: 'date',
  // Band configuration 
  bands: [
    { lower: 'q5', upper: 'q95', opacity: 0.15, name: '90% Range (5%-95%)' },
    { lower: 'q10', upper: 'q90', opacity: 0.25, name: '80% Range (10%-90%)' },
    { lower: 'q25', upper: 'q75', opacity: 0.35, name: 'IQR (25%-75%)' }
  ],
  // Line configuration 
  lines: ['q50'], 
  
  // Visual configuration
  lineOpacity: 0.9,
  lineStrokeWidth: 3,
  interpolate: 'linear', //'monotoneX'
  
  // Custom colors for bands (optional)
  bandColors: ['#4dabf7', '#69db7c', '#ffd43b'],
  
  // Custom colors for lines (optional)  
  lineColors: ['#000000'], // Black median line
  
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
  query: `SELECT * FROM api_consensus_entry_queue_daily`
};

export default metric;