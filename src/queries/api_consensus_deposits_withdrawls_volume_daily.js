const metric = {
  id: 'api_consensus_deposits_withdrawls_volume_daily',
  name: 'Deposits/Withdrawals (Volume)',
  description: 'Daily mGNO amount of deposits/withdrawals',
  metricDescription: 'Daily deposit and withdrawal volume in mGNO. Volume captures stake movement magnitude, not just event counts.',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],

  symbolSize: 2,
  lineWidth: 2,
  barOpacity: 0.8,  
  
  defaultZoom: {
    start: 0, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `SELECT * FROM dbt.api_consensus_deposits_withdrawls_volume_daily`,
};

export default metric;