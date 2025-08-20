const metric = {
  id: 'api_consensus_validators_apy_dist_old',
  name: 'Staking Rewards',
  description: 'Last 30 Days APY Distribution',
  chartType: 'quantileBands', 
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',

  
  // QuantileBands specific configuration
  xField: 'date',
  
  // Band configuration - array of objects defining bands
  bands: [
    { lower: 'apy_p10', upper: 'apy_p90', opacity: 0.25, name: '80% Range (10%-90%)' },
    { lower: 'apy_p25', upper: 'apy_p75', opacity: 0.35, name: 'IQR (25%-75%)' }
  ],
  
  // Line configuration - array of field names to draw as lines
  lines: ['apy_median'], 
  
  // Visual configuration
  lineOpacity: 0.9,
  lineStrokeWidth: 3,
  interpolate: 'linear', //'monotoneX'
  
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
      apy_p10, 
      apy_p25,
      apy_median,
      apy_p75,
      apy_p90
    FROM int_consensus_validators_apy_dist
    ORDER BY date ASC
  `
};

export default metric;