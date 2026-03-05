const metric = {
  id: 'api_execution_gpay_kpi_repeat_purchase_rate_latest',
  name: 'Repeat Purchase Rate',
  description: 'Latest month',
  metricDescription: `
  Percentage of paying wallets that made 2 or more card payments in the latest completed month. 
  
  __Formula:__ (wallets with 2+ payments / total paying wallets) × 100.
  `,
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
