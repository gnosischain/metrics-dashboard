const metric = {
  id: 'historical_cl_next_forks',
  name: 'CL Next Forks Distribution',
  description: 'Distribution for Broadcasted next forks across the network (Consensus Layer)',
  format: 'formatNumber',
  chartType: 'd3StackedBar',
  isTimeSeries: true,
  enableZoom: true,
  
  d3Config: {
    // Field mappings
    xField: 'date',
    yField: 'cnt',
    seriesField: 'fork',
    
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

  query: `SELECT date, fork, cnt FROM dbt.p2p_peers_cl_fork_daily WHERE label = 'Next Fork' ORDER BY date ASC, fork ASC`,
};

export default metric;