const metric = {
  id: 'historical_el_client_distribution',
  name: 'EL Client Distribution',
  description: 'Distribution of block production per client',
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

  query: `SELECT date, client, value AS value FROM dbt.execution_blocks_clients_daily ORDER BY date ASC, client ASC`,
};

export default metric;