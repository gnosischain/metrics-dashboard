const metric = {
  id: 'api_consensus_validators_balances_daily',
  name: 'Staked mGNO',
  description: 'Daily amount of staked mGNO (effective balance)',
  chartType: 'line', 
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
    start: 80, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'value',
  seriesField: 'label',


  query: `SELECT * FROM dbt.api_consensus_validators_balances_daily`,
};

export default metric;