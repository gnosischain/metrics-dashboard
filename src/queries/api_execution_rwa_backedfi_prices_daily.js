const metric = {
  id: 'api_execution_rwa_backedfi_prices_daily',
  name: 'RWA Prices',
  description: 'Backed Finance backed assets prices',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
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
  
  query: `SELECT * FROM dbt.api_execution_rwa_backedfi_prices_daily`,
};

export default metric;