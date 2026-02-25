const metric = {
  id: 'api_execution_gpay_balance_cohorts_holders_daily',
  name: 'Holders by Balance Cohort',
  description: 'Wallet count by balance bucket per token',
  metricDescription: 'Daily Gnosis Pay wallet counts by balance bucket with token and unit filters. Switch between native and USD bucketing.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 50,
    end: 100,
  },
  format: 'formatNumber',
  showTotal: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'token',
  unitFilterField: 'cohort_unit',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, token, cohort_unit, label, value
    FROM dbt.api_execution_gpay_balance_cohorts_holders_daily
  `,
};
export default metric;
