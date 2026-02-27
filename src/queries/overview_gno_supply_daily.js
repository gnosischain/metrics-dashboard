const metric = {
  id: 'overview_gno_supply_daily',
  name: 'GNO Supply Distribution',
  metricDescription: 'Daily GNO supply components by source category. Stacked view shows how each source contributes to total circulating supply.',
  titleFontSize: '1.3rem', 
  chartType: 'area', 
  isTimeSeries: true,
  enableZoom: true,
  defaultZoom: {
    start: 80, 
    end: 100   
  },
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