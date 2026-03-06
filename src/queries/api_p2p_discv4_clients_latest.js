const metric = {
  id: 'api_p2p_discv4_clients_latest',
  name: 'DiscV4 Client Distribution',
  description: 'Last day clients distribution',
  metricDescription: `
  Latest snapshot of DiscV4 peer distribution.

  Use the metric filter to switch between:

  - __Clients:__ execution-layer client implementation (Nethermind, Erigon, etc.)
  - __Platform:__ operating system (Linux, Windows, macOS)
  - __Provider:__ hosting provider (Hetzner, AWS, Home/Office, etc.)
  - __Country:__ geographic location based on IP geolocation

  Toggle between absolute peer counts and percentage share.`,
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