const metric = {
  id: 'historical_cl_client_distribution',
  name: 'Client Distribution',
  description: 'Distribution of client implementations across the network',
  format: 'formatNumber',
  chartType: 'd3StackedArea',
  isTimeSeries: true,
  enableZoom: true,
  
  d3Config: {
    // Field mappings
    xField: 'date',
    yField: 'value',
    seriesField: 'client',
    
   // Stacked area specific settings
   stacked: true,
   multiSeries: true,
   opacity: 0.8,
   strokeWidth: 1, 
   interpolate: 'monotoneX',
   
   // Visual settings
   enableLegend: true,
   enableTooltip: true,
   legendPosition: 'top',
   legendScrollable: true,
    
  },

  query: `SELECT * FROM dbt.p2p_peers_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;