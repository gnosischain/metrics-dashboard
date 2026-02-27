const metric = {
  id: 'api_execution_gpay_kpi_repeat_purchase_rate_latest',
  name: 'Repeat Purchase Rate',
  description: 'Latest month',
  metricDescription: 'Share of paying wallets with 2+ payments in the latest completed month.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatPercentageInt',
  valueField: 'value',
  query: `
    SELECT repeat_purchase_rate AS value
    FROM dbt.api_execution_gpay_kpi_monthly
    ORDER BY month DESC
    LIMIT 1
  `,
};

export default metric;
