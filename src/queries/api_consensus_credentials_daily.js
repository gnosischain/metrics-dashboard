const metric = {
  id: 'api_consensus_credentials_daily',
  name: 'Withdrawl Credentials Type',
  description: 'Validatorsasdasdt',
  chartType: 'area', 
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
  yField: 'pct',
  seriesField: 'credentials_type', 
  
  
  
  showTotal: true, 


  query: `SELECT * FROM dbt.api_consensus_credentials_daily`,
};

export default metric;