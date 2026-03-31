const metric = {
  id: 'api_execution_yields_lending_balance_cohorts_holders_daily',
  name: 'Holders',
  description: 'Lender count by balance cohort',
  metricDescription: 'Daily lender counts by balance cohort on Aave V3. Cohort buckets can be native-unit or USD-based.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'token',
  unitFilterField: 'cohort_unit',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT
      date,
      token,
      cohort_unit,
      label,
      value
    FROM dbt.api_execution_lending_balance_cohorts_holders_daily
  `,
};

export default metric;
