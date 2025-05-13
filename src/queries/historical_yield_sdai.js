const metric = {
  id: 'historical_yield_sdai',
  name: 'sDAI Yield',
  description: 'APY for sDAI on rolling Moving Average (MA)/Moving Median (MM)',
  format: 'formatNumber',
  chartType: 'line', 
  labelField: 'label', 
  valueField: 'apy',
  showPoints: false, 
  query: `SELECT * FROM dbt.yields_sdai_apy_daily WHERE label != 'Daily' ORDER BY date ASC, label ASC`,
};

export default metric;
