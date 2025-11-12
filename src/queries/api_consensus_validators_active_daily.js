const metric = {
  id: 'api_consensus_validators_active_daily',
  name: 'Active Validators',
  description: 'Daily Number of Active Validators',
  chartType: 'area', 
  isTimeSeries: true,
  format: 'formatNumber',

  // ECharts-compatible field configuration
  xField: 'date',
  yField: 'cnt',
  
  // Area chart specific styling
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.3,
  
  query: `SELECT * FROM dbt.api_consensus_validators_active_daily`,
};

export default metric;