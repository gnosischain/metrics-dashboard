const metric = {
  id: 'historical_active_validators',
  name: 'Active Validators',
  description: 'Daily Number of Active Validators',
  chartType: 'area', // Using ECharts area chart
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',
  
  // ECharts-compatible field configuration
  xField: 'date',
  yField: 'cnt',
  
  // Area chart specific styling
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.3,
  
  query: `SELECT date, cnt FROM dbt.consensus_validators_status_daily WHERE status = 'active_ongoing' ORDER BY date`,
};

export default metric;