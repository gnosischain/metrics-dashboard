const metric = {
  id: 'overview_kpi_gpay_active_users',
  name: 'GPay Active Users',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Distinct Gnosis Pay wallets that made at least one card payment on the most recent complete day.',
  query: `
    SELECT date, active_users AS value
    FROM dbt.fct_execution_gpay_activity_daily
    WHERE date >= today() - INTERVAL 30 DAY
    ORDER BY date ASC
  `
};

export default metric;
