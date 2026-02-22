const metric = {
  id: 'api_execution_tokens_active_senders_daily',
  name: 'Unique Senders',
  description: 'Daily number of distinct sending addresses per token',
  metricDescription: 'Daily unique sending addresses per token. Token filter isolates sender activity for a specific asset.',
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