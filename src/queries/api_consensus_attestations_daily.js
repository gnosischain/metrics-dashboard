const metric = {
  id: 'api_consensus_attestations_daily',
  name: 'Attestations',
  description: 'Daily number of attestations per inclusion delay',
  metricDescription: 'Daily attestation counts by inclusion-delay bucket. Lower delay buckets indicate faster inclusion and healthier validator performance.',
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
  
  defaultZoom: {
    start: 0, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'cnt',
  seriesField: 'inclusion_delay',

  query: `SELECT * FROM dbt.api_consensus_attestations_daily`,
};

export default metric;