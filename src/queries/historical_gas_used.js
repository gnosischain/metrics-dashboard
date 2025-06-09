const metric = {
  id: 'historical_gas_used',
  name: 'EL Gas Used',
  description: 'Daily gas used in Gwei',
  chartType: 'area', // Changed from 'd3StackedArea' to 'area'
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
  yField: 'value',
  seriesField: 'transaction_type', // This will create stacked areas for different transaction types
  
  // Area chart specific styling for stacked areas
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.7, // Good opacity for stacked areas
  
  // Tooltip configuration
  showTotal: true, // Show total sum in tooltip
  
  query: `SELECT date, transaction_type, gas_used/POWER(10,9) AS value FROM dbt.execution_txs_info_daily WHERE success = 1 ORDER BY date, transaction_type`,
};

export default metric;