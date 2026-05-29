const metric = {
  id: 'overview_kpi_transactions',
  name: 'Daily Transactions',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'All successful transactions on Gnosis Chain on the most recent complete day.',
  query: `
    SELECT date, SUM(value) AS value
    FROM dbt.api_execution_transactions_cnt_daily
    WHERE date >= today() - INTERVAL 30 DAY
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
