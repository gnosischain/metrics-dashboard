const metric = {
  id: 'historical_gas_used',
  name: 'EL Gas Used',
  description: 'Daily gas used in Gwei',
  format: 'formatNumber',
  chartType: 'area', 
  labelField: 'transaction_type', 
  valueField: 'value',
  fill: true, 
  showPoints: false, 
  stackedArea: true,
  enableZoom: true,
  isTimeSeries: true, 
  query: `SELECT date, transaction_type, gas_used/POWER(10,9) AS value FROM dbt.execution_txs_info_daily WHERE success = 1 ORDER BY date, transaction_type`
};

export default metric;