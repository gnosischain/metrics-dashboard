const metric = {
  id: 'historical_cl_client_distribution',
  name: 'Client Distribution',
  description: 'Distribution of client implementations across the network',
  chartType: 'area', 
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  
  defaultZoom: {
    start: 70, 
    end: 100   
  },
  
  xField: 'date',
  yField: 'value',
  seriesField: 'client', 
  
  smooth: true,
  symbolSize: 2,
  lineWidth: 2,
  areaOpacity: 0.7, 
  
  showTotal: true, 

  query: `SELECT * FROM dbt.p2p_peers_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;