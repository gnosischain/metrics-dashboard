const metric = {
  id: 'overview_sector_tokens',
  name: 'Tokens',
  kpiLabel: 'Token Holders',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  linkTo: 'tokens',
  changePeriod: 'vs 30d ago',
  query: `
    SELECT date, SUM(value) AS value
    FROM dbt.api_execution_tokens_holders_daily
    WHERE date >= today() - INTERVAL 30 DAY
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
