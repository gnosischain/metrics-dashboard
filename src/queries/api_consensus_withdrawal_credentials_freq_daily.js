const metric = {
  id: 'api_consensus_withdrawal_credentials_freq_daily',
  name: 'Distict Withdrawal Credentials',
  description: 'per amout of validators',
  chartType: 'area', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  showTotal: true, 
  
  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [1, 1, 0, 0],

  symbolSize: 2,
  lineWidth: 2,
  barOpacity: 0.8,  
  
  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  defaultZoom: {
    start: 0, 
    end: 100   
  },

  query: `SELECT * FROM dbt.api_consensus_withdrawal_credentials_freq_daily`,
};

export default metric;