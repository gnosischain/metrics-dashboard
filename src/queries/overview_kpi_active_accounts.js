const metric = {
  id: 'overview_kpi_active_accounts',
  name: 'Daily Active Accounts',
  chartType: 'kpi',
  valueField: 'value',
  sparklineField: 'value',
  format: 'formatNumberCompact',
  changePeriod: 'vs 30d ago',
  metricDescription: 'Unique addresses that sent at least one transaction on Gnosis Chain on the most recent complete day.',
  query: `
    SELECT date, SUM(value) AS value
    FROM dbt.api_execution_transactions_active_accounts_by_sector_daily
    WHERE date >= today() - INTERVAL 30 DAY
    GROUP BY date
    ORDER BY date ASC
  `
};

export default metric;
