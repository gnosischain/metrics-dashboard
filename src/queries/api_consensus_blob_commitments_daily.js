const metric = {
  id: 'api_consensus_blob_commitments_daily',
  name: 'Blob Commitments',
  description: 'Daily number blob commitments',
  chartType: 'bar', 
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
  
  defaultZoom: {
    start: 80, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'value',

  query: `SELECT * FROM dbt.api_consensus_blob_commitments_daily`,
};

export default metric;