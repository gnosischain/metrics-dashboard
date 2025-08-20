const metric = {
  id: 'historical_yield_sdai',
  name: 'sDAI Yield',
  description: 'APY for sDAI on rolling Moving Median (MM)',
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
  yField: 'apy', 
  seriesField: 'label',
  
  // Optional chart styling
  smooth: true,
  symbolSize: 4,
  lineWidth: 2,
  
  query: `SELECT * FROM dbt.fct_yields_sdai_apy_daily`,
};

export default metric;