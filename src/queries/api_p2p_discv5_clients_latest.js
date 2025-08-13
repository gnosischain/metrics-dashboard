const metric = {
  id: 'api_p2p_discv5_clients_latest',
  name: 'DiscV5 Client Distribution',
  description: 'Last day clients distribution',
  format: 'formatNumber',
  chartType: 'pie',
  
  nameField: 'label',
  valueField: 'value',
  labelField: 'metric',

  enableFiltering: true, 
  
  query: `
    SELECT * FROM dbt.api_p2p_discv5_clients_latest
  `,
};

export default metric;