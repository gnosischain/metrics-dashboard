const metric = {
  id: 'api_consensus_validators_apy_daily',
  name: 'EL Client Distribution',
  description: 'Distribution of block production per client',
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
    start: 70, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'apy',
  seriesField: 'label',

  enableFiltering: false, 

  query: `SELECT * FROM dbt.api_consensus_validators_apy_daily`,
};

export default metric;