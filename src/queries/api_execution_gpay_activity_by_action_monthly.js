const metric = {
  id: 'api_execution_gpay_activity_by_action_monthly',
  name: 'Activity by Action',
  description: 'Monthly actions executed',
  metricDescription: 'Monthly Gnosis Pay activity segmented by action type. Toggle between action counts and USD volume.',
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'activity_count',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  resolutions: ['daily', 'weekly', 'monthly'],
  defaultResolution: 'weekly',
  valueModeOptions: [
    {
      key: 'activity_count',
      label: 'Action Count',
      valueField: 'activity_count',
      format: 'formatNumber',
    },
    {
      key: 'volume_usd',
      label: 'Volume (USD)',
      valueField: 'volume_usd',
      format: 'formatCurrency',
    },
  ],
  defaultValueMode: 'activity_count',
  query: `
    SELECT
      toDate(month) AS date,
      action AS label,
      activity_count,
      volume_usd
    FROM dbt.api_execution_gpay_activity_by_action_monthly
    ORDER BY date ASC, label ASC
  `,
};

export default metric;
