const metric = {
  id: 'api_execution_tokens_active_senders_daily',
  name: 'Token Active Senders',
  description: 'Number of distinct sending addresses per token per day.',
  chartType: 'area',
  isTimeSeries: true,
  stacked: false,
  enableZoom: true,
  defaultZoom: {
    start: 80,
    end: 100,
  },
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