/**
 * Example metric configuration using the new QuantileBandsChart
 * Location: src/queries/consensus/example_quantile_bands.js
 */

const metric = {
  id: 'example_quantile_bands',
  name: 'Balance Value Distribution',
  description: 'Daily Validators balance quantiles',
  chartType: 'quantileBands', // New chart type
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
    { lower: 'q05', upper: 'q95', opacity: 0.15, name: '90% Range (5%-95%)' },
    { lower: 'q10', upper: 'q90', opacity: 0.25, name: '80% Range (10%-90%)' },
    { lower: 'q25', upper: 'q75', opacity: 0.35, name: 'IQR (25%-75%)' }
  ],
  
  // Line configuration - array of field names to draw as lines
  lines: ['q50'], 
  
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
  
  // Custom naming functions (optional) - NOTE: These need to be defined as functions, not strings
  // lineNamer: (lineField) => {
  //   const nameMap = {
  //     'q50': 'Median',
  //     'q25': '25th Percentile',
  //     'q75': '75th Percentile'
  //   };
  //   return nameMap[lineField] || lineField;
  // },
  
  // Universal watermark configuration
  showWatermark: true,
  watermarkPosition: 'bottom-right',
  watermarkSize: 25,
  watermarkOpacity: 0.3,
  
  //yAxis: {
  //  type: 'log',
  //  logBase: 10, // Optional: specify the logarithm base (default is 10)
  //  min: 'dataMin', // Optional: set minimum value
  //  max: 'dataMax', // Optional: set maximum value
  //},

  // Example query that returns quantile data
  query: `
    SELECT 
      date,
      q05,
      q10, 
      q25,
      q50,
      q75,
      q90,
      q95,
      avg_balance
    FROM consensus_validators_balances_dist_daily
    ORDER BY date ASC
  `
};

export default metric;