const metric = {
  id: 'api_execution_transactions_cnt_daily',
  name: 'EL Transactions Count',
  description: 'Daily count of transactions',
  chartType: 'area',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  // Default zoom configuration
  defaultZoom: {
    start: 70, // Start at 70% (showing last 30%)
    end: 100   // End at 100%
  },
  
  // ECharts-compatible field configuration
  xField: 'date',
  yField: 'value',
  seriesField: 'transaction_type', // This will create stacked areas for different transaction types
  
  // Area chart specific styling for stacked areas
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.7, // Good opacity for stacked areas
  
  // Tooltip configuration
  showTotal: true, // Show total sum in tooltip
  
  query: `SELECT * FROM dbt.api_execution_transactions_cnt_daily`,
};

export default metric;