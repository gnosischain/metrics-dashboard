const metric = {
  id: 'historical_n_txs',
  name: 'EL Transactions Count',
  description: 'Daily count of transactions',
  format: 'formatNumber',
  chartType: 'area', 
  labelField: 'transaction_type', 
  valueField: 'value',
  fill: true, 
  showPoints: false, 
  stackedArea: true,
  enableZoom: true,
  isTimeSeries: true, 
  query: `SELECT date, transaction_type, n_txs AS value FROM dbt.execution_txs_info_daily WHERE success = 1 ORDER BY date, transaction_type`
};

export default metric;