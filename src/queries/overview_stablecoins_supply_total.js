const metric = {
  id: 'overview_stablecoins_supply_total',
  name: 'Stablecoins Market Cap',
  valueField: 'value',
  chartType: 'number',
  format: null,
  titleFontSize: '1.3rem', 
  fontSize: '2.6rem',    
  query: `SELECT CONCAT('+$',toString(floor(SUM(value_usd)/1000000)), 'M') AS value FROM dbt.api_execution_tokens_supply_distribution_latest WHERE token_class = 'STABLECOIN' AND token NOT IN ('sDAI','WxDAI')`,
};

export default metric;
