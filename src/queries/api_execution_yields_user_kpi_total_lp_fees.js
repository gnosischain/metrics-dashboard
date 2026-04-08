const metric = {
  id: 'api_execution_yields_user_kpi_total_lp_fees',
  name: 'LP Fees Collected',
  description: 'Lifetime (USD)',
  metricDescription: 'Total fees claimed via Collect events across all LP positions for the selected wallet.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, total_lp_fees_usd AS value
    FROM dbt.api_execution_yields_user_kpis
  `,
};

export default metric;
