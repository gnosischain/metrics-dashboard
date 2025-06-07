const metric = {
  id: 'historical_yield_sdai',
  name: 'sDAI Yield',
  description: 'APY for sDAI on rolling Moving Median (MM)',
  chartType: 'line', // Using ECharts line chart
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  // ECharts-compatible field configuration
  xField: 'date',
  yField: 'apy', 
  seriesField: 'label', // This will create multiple lines for different labels
  
  // Optional chart styling
  smooth: true,
  symbolSize: 4,
  lineWidth: 2,
  
  query: `SELECT * FROM dbt.yields_sdai_apy_daily WHERE label NOT LIKE '%MA' AND date >= '2023-10-12' ORDER BY date ASC, label ASC`,
};

export default metric;