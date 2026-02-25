const metric = {
  id: 'api_execution_gpay_cashback_recipients_weekly',
  name: 'Weekly Cashback Recipients',
  description: 'Unique wallets receiving cashback per week',
  metricDescription: 'Weekly count of distinct wallets that received at least one cashback transfer.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, value
    FROM dbt.api_execution_gpay_cashback_recipients_weekly
  `,
};
export default metric;
