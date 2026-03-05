const metric = {
  id: 'api_execution_gpay_cashback_recipients_weekly',
  name: 'Recipients',
  description: 'Unique wallets per week',
  metricDescription: 'Weekly count of unique wallets that received at least one GNO cashback transfer. A wallet is counted once per week regardless of how many cashback events it received.',
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
