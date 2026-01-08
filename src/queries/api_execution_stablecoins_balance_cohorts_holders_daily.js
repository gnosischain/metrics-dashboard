const metric = {
  id: 'api_execution_stablecoins_balance_cohorts_holders_daily',
  name: 'Balance Cohorts (Holders)',
  description: 'Distribution of holders across balance ranges',
  chartType: 'area',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  defaultZoom: {
    start: 80,
    end: 100,
  },
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT
      date,
      token,
      label,
      value
    FROM dbt.api_execution_stablecoins_balance_cohorts_holders_daily
  `,
};

export default metric;

