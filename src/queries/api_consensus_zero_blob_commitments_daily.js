const metric = {
  id: 'api_consensus_zero_blob_commitments_daily',
  name: 'Blocks With Blob Commitments',
  description: 'Daily produced blocks with/without blobs',
  metricDescription: 'Daily split of blocks with versus without blob commitments. Use it to monitor blob adoption relative to total block production.',
  chartType: 'area', 
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
  seriesField: 'label',

  query: `SELECT * FROM dbt.api_consensus_zero_blob_commitments_daily`,
};

export default metric;