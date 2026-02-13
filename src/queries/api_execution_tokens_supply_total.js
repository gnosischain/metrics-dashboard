const metric = {
  id: 'api_execution_tokens_supply_total',
  name: 'Total Supply',
  description: 'Per token',
  format: 'formatNumber',
  valueField: 'value_native',
  chartType: 'numberDisplay',
  variant: 'default',
  enableFiltering: true,
  labelField: 'token',

  // Unit toggle support (Native/USD)
  unitFields: {
    native: { field: 'value_native', format: 'formatNumber' },
    usd: { field: 'value_usd', format: 'formatNumberWithUSD' }
  },

  query: `SELECT 
      token, 
      ROUND(value_native,0) AS value_native,
      ROUND(value_usd,0) AS value_usd
    FROM dbt.api_execution_tokens_supply_latest_by_token`,
};
export default metric;

