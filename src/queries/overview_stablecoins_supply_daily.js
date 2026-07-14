const metric = {
  id: 'overview_stablecoins_supply_daily',
  name: 'Stablecoin Supply by Token',
  description: 'Stablecoin supply (USD) over time, by token',
  metricDescription: 'Daily circulating USD supply of stablecoins on Gnosis Chain (excluding sDAI, WxDAI and BRZ), stacked by token.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatCurrencyCompact',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT date, token AS label, SUM(value_usd) AS value
    FROM dbt.api_execution_tokens_supply_daily
    WHERE token_class = 'STABLECOIN' AND token NOT IN ('sDAI','WxDAI','BRZ')
    GROUP BY date, token
    ORDER BY date ASC
  `
};

export default metric;
