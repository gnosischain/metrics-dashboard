const metric = {
  id: 'historical_rwa_prices',
  name: 'RWA Prices',
  description: 'Backed Finance backed assets prices',
  chartType: 'line', // Using ECharts line chart
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  // ECharts-compatible field configuration
  xField: 'date',
  yField: 'price',
  seriesField: 'bticker', // This will create multiple lines for different assets
  
  // Optional chart styling
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  
  query: `SELECT * FROM dbt.rwa_backedfi_prices_1d WHERE date >= DATE '2024-11-01' ORDER BY date ASC, bticker ASC`,
};

export default metric;