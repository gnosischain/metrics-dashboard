const metric = {
  id: 'api_p2p_discv5_next_fork_daily',
  name: 'CL Next Forks Distribution',
  description: 'Distribution for Broadcasted next forks (Consensus Layer)',
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