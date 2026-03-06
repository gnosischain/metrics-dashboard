const metric = {
  id: 'api_p2p_discv5_clients_latest',
  name: 'DiscV5 Client Distribution',
  description: 'Last day clients distribution',
  metricDescription: `
  Last day snapshot of DiscV5 peer distribution.

  Use the metric filter to switch between:

  - __Clients:__ consensus-layer client implementation (Lighthouse, Teku, Lodestar, etc.)
  - __Platform:__ operating system (Linux, Windows, macOS)
  - __Provider:__ hosting provider (Hetzner, AWS, Home/Office, etc.)
  - __Country:__ geographic location based on IP geolocation
  `,
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