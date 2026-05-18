const metric = {
  id: 'api_execution_yields_lending_balance_cohorts_holders_daily',
  name: 'Holders',
  description: 'Lender count by balance cohort',
  metricDescription:
    'Daily unique-lender counts by balance cohort across Gnosis lending markets ' +
    '(Aave V3 and SparkLend). Stacked bars show how many wallets fall into each ' +
    'size bucket for the selected token and protocol.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'token',
  globalFilterField: 'token',
  applySecondaryGlobalFilter: true,
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT
      date,
      protocol,
      token,
      cohort_unit,
      label,
      value
    FROM dbt.api_execution_lending_balance_cohorts_holders_daily
  `,
};

export default metric;
