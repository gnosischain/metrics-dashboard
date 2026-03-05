const metric = {
  id: 'api_p2p_discv4_clients_latest',
  name: 'DiscV4 Client Distribution',
  description: 'Last day clients distribution',
  metricDescription: 'Latest DiscV4 client distribution snapshot. Metric filter toggles between absolute peer counts and percentage share.',
  format: 'formatNumber',
  chartType: 'pie',
  
  nameField: 'label',
  valueField: 'value',
  labelField: 'metric',

  enableFiltering: true, 
  
  query: `
    SELECT * FROM dbt.api_p2p_discv4_clients_latest
  `,
};

export default metric;