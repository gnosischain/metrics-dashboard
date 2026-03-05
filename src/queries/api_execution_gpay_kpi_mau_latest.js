const metric = {
  id: 'api_execution_gpay_kpi_mau_latest',
  name: 'MAU',
  description: 'Latest month',
  metricDescription: 'Distinct wallets with any Gnosis Pay activity (payments, deposits, withdrawals, cashback) in the latest completed calendar month.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT mau AS value
    FROM dbt.api_execution_gpay_kpi_monthly
    ORDER BY month DESC
    LIMIT 1
  `,
};

export default metric;
