const metric = {
  id: 'api_execution_gpay_balance_cohorts_holders_daily',
  name: 'Holders',
  description: 'Wallet count by balance cohort',
  metricDescription: 'Daily wallet count grouped by balance cohort (e.g. 0–10, 10–100, 100–1K). Use the token dropdown and Native/USD toggle to switch between balance denominations. Shows how wallets are distributed across balance tiers.',
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
