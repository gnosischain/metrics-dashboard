const metric = {
  id: 'api_consensus_staked_daily',
  name: 'Staked GNO',
  description: 'Daily amount of staked GNO',
  metricDescription: 'Daily total staked GNO on the consensus layer. Reflects aggregate validator effective stake over time.',
  chartType: 'area', 
  isTimeSeries: true,
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