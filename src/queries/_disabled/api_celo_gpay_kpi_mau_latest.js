const metric = {
  id: 'api_celo_gpay_kpi_mau_latest',
  name: 'MAU',
  description: 'Latest month',
  metricDescription: 'Distinct card Safes with any Gnosis Pay activity (payments, top-ups, withdrawals) in the latest completed calendar month. USDC/USDT only.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT mau AS value
    FROM dbt.api_celo_gpay_kpi_monthly
    ORDER BY month DESC
    LIMIT 1
  `,
};

export default metric;
