const metric = {
  id: 'overview_kpi_dex_volume',
  name: 'DEX Volume',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatCurrencyCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Daily DEX trading volume across all protocols (Uniswap V3, Balancer, Swapr) on Gnosis Chain, on the most recent complete day.',
  query: `
    SELECT date, sum(value) AS value
    FROM dbt.api_execution_trades_stats_volume_ts
    WHERE date >= today() - INTERVAL 30 DAY
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
