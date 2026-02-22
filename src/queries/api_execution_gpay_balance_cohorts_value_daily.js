const metric = {
  id: 'api_execution_gpay_balance_cohorts_value_daily',
  name: 'Value by Balance Cohort',
  description: 'Daily total USD value by balance cohort — all tokens',
  metricDescription: 'Daily total wallet value (USD) by balance cohort. Stacked areas show where aggregate balances are concentrated.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 50,
    end: 100,
  },
  format: 'formatCurrency',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_balance_cohorts_value_daily
  `,
};
export default metric;
