const metric = {
  id: 'api_execution_trades_stats_lifetime_first_trade',
  name: 'First Trade',
  metricDescription: 'Date of the earliest indexed DEX trade on Gnosis Chain across Uniswap V3, Balancer V2/V3 and Swapr V3. Not affected by the time window.',
  valueField: 'value',
  chartType: 'numberDisplay',
  variant: 'default',
  query: `SELECT toString(first_trade_date) AS value FROM dbt.api_execution_trades_stats_lifetime`,
};

export default metric;
