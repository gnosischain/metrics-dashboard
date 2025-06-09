const metric = {
  id: 'historical_cl_next_forks',
  name: 'CL Next Forks Distribution',
  description: 'Distribution for Broadcasted next forks across the network (Consensus Layer)',
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  defaultZoom: {
    start: 70, 
    end: 100   
  },
  
  barOpacity: 0.8, 
  
  // Field mappings for the bar chart
  xField: 'date',
  yField: 'cnt',
  seriesField: 'fork', 

  // Bar chart styling
  barWidth: 'auto',
  barMaxWidth: 50,
  borderRadius: [2, 2, 0, 0],

  showTotal: true, 

  query: `SELECT date, fork, cnt FROM dbt.p2p_peers_cl_fork_daily WHERE label = 'Next Fork' ORDER BY date ASC, fork ASC`,
};

export default metric;