const metric = {
  id: 'api_consensus_blob_commitments_daily',
  name: 'Blob Commitments: Count',
  description: 'Daily number blob commitments',
  metricDescription: 'Daily number of blob commitments included by execution payloads. This tracks EIP-4844 data-availability usage over time.',
  chartType: 'bar', 
  format: 'formatNumber',
  isTimeSeries: true,
  enableZoom: true,
  showTotal: true, 
  
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

  query: `SELECT * FROM dbt.api_consensus_blob_commitments_daily`,
};

export default metric;