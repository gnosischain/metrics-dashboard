const metric = {
  id: 'api_consensus_staked_daily',
  name: 'Staked mGNO',
  description: 'Daily amount of staked mGNO',
  chartType: 'area', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.3,
  
  
  xField: 'date',
  yField: 'value',


  query: `SELECT * FROM dbt.api_consensus_staked_daily`,
};

export default metric;