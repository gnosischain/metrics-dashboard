const metric = {
  id: 'overview_kpi_gpay_volume',
  name: 'Daily GPay Volume',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatCurrencyCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Total USD value of Gnosis Pay card payments on the most recent complete day.',
  query: `
    SELECT date, SUM(value) AS value
    FROM dbt.api_execution_gpay_volume_payments_by_token_daily
    WHERE date >= today() - INTERVAL 30 DAY
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
