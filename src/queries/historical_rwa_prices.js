const metric = {
  id: 'historical_rwa_prices',
  name: 'RWA Prices',
  description: 'Backed Finance backed assets prices',
  chartType: 'line',
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
  yField: 'price', 
  seriesField: 'bticker',
  
  // Optional chart styling
  smooth: true,
  symbolSize: 4,
  lineWidth: 2,
  
  query: `SELECT * FROM dbt.rwa_backedfi_prices_1d WHERE date >= DATE '2024-11-01' ORDER BY date ASC, bticker ASC`,
};

export default metric;