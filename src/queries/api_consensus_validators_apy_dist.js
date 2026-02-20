const metric = {
  id: 'api_consensus_validators_apy_dist',
  name: 'APY Distribution',
  description: "Last 30 Days",
  metricDescription: 'Boxplots summarize daily validator APY dispersion over the last 30 days. Whiskers use the 10th and 90th percentiles, and the box shows the interquartile range with median.',
  chartType: 'boxplot', 
  isTimeSeries: false,
  enableZoom: false,
  format: 'formatNumber',
  
  // Enable pre-calculated percentiles mode
  usePreCalculatedStats: true,
  
  // Boxplot specific configuration
  categoryField: 'date', // X-axis categories
  
  // Map your percentile fields to boxplot statistics
  // Using Q10/Q90 instead of Q05/Q95 to avoid the 0 value issue
  minField: 'q10',      // 10th percentile as minimum (should be > 0)
  q1Field: 'q25',       // 25th percentile (Q1)
  medianField: 'q50',   // 50th percentile (median)  
  q3Field: 'q75',       // 75th percentile (Q3)
  maxField: 'q90',      // 90th percentile as maximum
  
  // Visual styling
  boxWidth: 0.7,        // Width of boxes (0.0 to 1.0)
  showOutliers: false,  // Don't show outliers for pre-calculated data
  outlierSymbolSize: 4,
  
  // Optional: Custom series name
  seriesName: 'APY Distribution',
  
  // Universal watermark configuration
  showWatermark: true,
  watermarkPosition: 'bottom-right',
  watermarkSize: 25,
  watermarkOpacity: 0.3,
  
  // Query to get pre-calculated percentiles
  query: `
    SELECT * FROM dbt.api_consensus_validators_apy_dist_last_30_days
  `
};

export default metric;