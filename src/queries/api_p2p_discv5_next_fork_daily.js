const metric = {
  id: 'api_p2p_discv5_next_fork_daily',
  name: 'CL Next Forks Distribution',
  description: 'Distribution for Broadcasted next forks (Consensus Layer)',
  metricDescription: `
  Daily distribution of the __next__ fork version announced by DiscV5 peers.

  Peers broadcast the fork they plan to transition to, allowing the network to gauge upgrade readiness before a hard fork event.

  A rising count for the upcoming fork signals that node operators are updating their software ahead of the transition.`,
  chartType: 'bar', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  defaultZoom: {
    start: 0, 
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

  query: `SELECT * FROM dbt.api_p2p_discv5_next_fork_daily`,
};

export default metric;