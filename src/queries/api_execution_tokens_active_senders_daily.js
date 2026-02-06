const metric = {
  id: 'api_execution_tokens_active_senders_daily',
  name: 'Token Active Senders',
  description: 'Number of distinct sending addresses per token per day.',
  chartType: 'bar',
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
    FROM dbt.api_execution_tokens_active_senders_daily
  `,
};

export default metric;