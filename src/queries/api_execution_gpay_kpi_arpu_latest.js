const metric = {
  id: 'api_execution_gpay_kpi_arpu_latest',
  name: 'ARPU',
  description: 'Latest month (USD)',
  metricDescription: 'Average revenue per paying user in the latest completed month.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  query: `
    SELECT arpu AS value
    FROM dbt.api_execution_gpay_kpi_monthly
    ORDER BY month DESC
    LIMIT 1
  `,
};

export default metric;
