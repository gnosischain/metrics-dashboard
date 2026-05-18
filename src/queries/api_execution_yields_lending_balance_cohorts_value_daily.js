const metric = {
  id: 'api_execution_yields_lending_balance_cohorts_value_daily',
  name: 'Value',
  description: 'Total value by balance cohort',
  metricDescription:
    'Daily aggregate balances by lender cohort across Gnosis lending markets ' +
    '(Aave V3 and SparkLend). Total bar height equals the lending TVL for the ' +
    'selected token and protocol. Unit toggle switches between native amount ' +
    'and USD value.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value_native',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'token',
  globalFilterField: 'token',
  applySecondaryGlobalFilter: true,
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    native: { field: 'value_native', format: 'formatNumber' },
    usd:    { field: 'value_usd',    format: 'formatCurrency' }
  },
  query: `
    SELECT
      date,
      protocol,
      token,
      cohort_unit,
      label,
      value_native,
      value_usd
    FROM dbt.api_execution_lending_balance_cohorts_value_daily
  `,
};

export default metric;
