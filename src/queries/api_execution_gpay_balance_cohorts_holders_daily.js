const metric = {
  id: 'api_execution_gpay_balance_cohorts_holders_daily',
  name: 'Holders by Balance Cohort',
  description: 'Daily wallet count by USD balance cohort — all tokens',
  metricDescription: 'Daily Gnosis Pay wallet counts by USD balance bucket. Cohorts show distribution shifts across low- and high-balance users.',
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
  tooltipOrder: 'valueDesc',
  query: `
    SELECT date, label, value
    FROM dbt.api_execution_gpay_balance_cohorts_holders_daily
  `,
};
export default metric;
