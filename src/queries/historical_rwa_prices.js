const metric = {
  id: 'historical_rwa_prices',
  name: 'RWA Prices',
  description: 'Backed Finance backed assets prices',
  format: 'formatNumber',
  chartType: 'line', 
  labelField: 'bticker', 
  valueField: 'price',
  showPoints: false,
  query: `SELECT * FROM dbt.rwa_backedfi_prices_1d WHERE date >= DATE '2024-11-01' ORDER BY date ASC, bticker ASC`,
};

export default metric;
