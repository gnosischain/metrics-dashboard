const metric = {
  id: 'api_consensus_deposits_withdrawls_cnt_daily',
  name: 'Deposits/Withdrawals (Count)',
  description: 'Daily number of deposits/withdrawals',
  metricDescription: 'Daily count of validator deposits and withdrawals. Compare both series to monitor validator-set expansion versus exits.',
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

  query: `SELECT * FROM dbt.api_consensus_deposits_withdrawls_cnt_daily`,
};

export default metric;