const metric = {
  id: 'overview_stablecoins_supply_latest',
  name: 'Stablecoin Supply',
  metricDescription: 'Latest stablecoin supply split in USD (excluding sDAI and WxDAI). Pie shares are relative to the filtered stablecoin set.',
  chartType: 'pie',
  nameField: 'token',
  valueField: 'value_usd',
  format: 'formatCurrency',
  useAbbreviatedLabels: true,
  pieLabelValue: false,
  query: `SELECT token, value_usd, percentage FROM dbt.api_execution_tokens_supply_distribution_latest WHERE token_class = 'STABLECOIN' AND token NOT IN ('sDAI','WxDAI')`,
};

export default metric;
