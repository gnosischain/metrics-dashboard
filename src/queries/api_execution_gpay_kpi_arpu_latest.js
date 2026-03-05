const metric = {
  id: 'api_execution_gpay_kpi_arpu_latest',
  name: 'ARPU',
  description: 'Latest month (USD)',
  metricDescription: `Average card spending per paying wallet in the latest completed month. Calculated as total payment volume (USD) divided by Payment MAU. 
  
  __Note:__ this measures user spending volume, not Gnosis Pay platform revenue.`,
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
