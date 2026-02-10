const metric = {
  id: 'api_execution_tokens_holders_daily',
  name: 'Holders',
  description: 'Daily number ofaddresses with non-zero balance per token',
  chartType: 'area',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  xField: 'date',
  yField: 'value',
  enableFiltering: true,
  labelField: 'token',
  format: 'formatNumber',
  tooltipOrder: 'valueDesc',

  query: `
    SELECT
      date,
      token,
      value
    FROM dbt.api_execution_tokens_holders_daily
  `,
};

export default metric;