const metric = {
  id: 'overview_gno_supply_daily',
  name: 'GNO Supply Distribution',
  titleFontSize: '1.3rem', 
  chartType: 'area', 
  isTimeSeries: true,
  enableZoom: false,
  format: 'formatNumber',
  showTotal: true, 
  
  symbolSize: 2,
  lineWidth: 2,
  
  xField: 'date',
  yField: 'supply',
  seriesField: 'label',

  query: `SELECT * FROM dbt.api_crawlers_data_gno_supply_daily`,
};

export default metric;