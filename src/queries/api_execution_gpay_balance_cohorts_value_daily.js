const metric = {
  id: 'api_execution_gpay_balance_cohorts_value_daily',
  name: 'Value by Balance Cohort',
  description: 'Total value by balance bucket per token',
  metricDescription: 'Daily aggregate wallet balances by balance cohort with token and unit filters. Unit toggle switches between native amount and USD value.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 50,
    end: 100,
  },
  xField: 'date',
  yField: 'value_native',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'token',
  unitFilterField: 'cohort_unit',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  unitFields: {
    native: { field: 'value_native', format: 'formatNumber' },
    usd: { field: 'value_usd', format: 'formatCurrency' }
  },
  query: `
    SELECT date, token, cohort_unit, label, value_native, value_usd
    FROM dbt.api_execution_gpay_balance_cohorts_value_daily
  `,
};
export default metric;
