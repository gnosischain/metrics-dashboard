const metric = {
  id: 'api_execution_gpay_kpi_payment_volume_latest',
  name: 'Payment Volume',
  description: 'Latest month (USD)',
  metricDescription: 'Total payment volume in USD for the latest completed month.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  query: `
    SELECT total_payment_volume_usd AS value
    FROM dbt.api_execution_gpay_kpi_monthly
    ORDER BY month DESC
    LIMIT 1
  `,
};

export default metric;
