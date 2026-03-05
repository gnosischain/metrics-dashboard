const metric = {
  id: 'api_execution_transactions_gas_used_weekly',
  name: 'EL Gas Used',
  description: 'Weekly gas used in Gwei',
  metricDescription: 'Weekly execution-layer gas used by transaction type. Compare structural shifts in demand across transaction formats.',
  chartType: 'area', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  defaultZoom: {
    start: 70, 
    end: 100   
  },
  xField: 'date',
  yField: 'value',
  seriesField: 'label', 
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.7, 
  showTotal: true, 
  
  query: `SELECT * FROM dbt.api_execution_transactions_gas_used_weekly`,
};

export default metric;