const metric = {
  id: 'overview_kpi_stablecoin_supply',
  name: 'Stablecoin Supply',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatCurrencyCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Total USD value of stablecoins circulating on Gnosis Chain, excluding sDAI and WxDAI.',
  query: `
    SELECT date, SUM(value_usd) AS value
    FROM dbt.api_execution_tokens_supply_daily
    WHERE token_class = 'STABLECOIN'
      AND token NOT IN ('sDAI','WxDAI')
      AND date >= today() - INTERVAL 30 DAY
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
