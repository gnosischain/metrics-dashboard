const metric = {
  id: 'api_execution_circles_v2_avatar_trusts_daily',
  name: 'Trust Growth',
  description: 'Cumulative trusts over time',
  metricDescription: 'Daily cumulative trusts given and received by the selected avatar.',
  chartType: 'line',
  globalFilterField: 'avatar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',

  query: `
    SELECT avatar, date, 'Given' AS label, trusts_given_count AS value
    FROM dbt.api_execution_circles_v2_avatar_trusts_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    UNION ALL
    SELECT avatar, date, 'Received' AS label, trusts_received_count AS value
    FROM dbt.api_execution_circles_v2_avatar_trusts_daily
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
