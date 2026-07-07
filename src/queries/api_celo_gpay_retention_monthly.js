const metric = {
  id: 'api_celo_gpay_retention_monthly',
  name: 'User Count',
  description: 'By activation cohort',
  metricDescription: `
  Monthly active Safe count broken down by activation cohort.
  Each color represents Safes that made their first payment in that month.
  Shows how many Safes from each cohort remain active over time.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  tooltipOrder: 'valueDesc',
  showTotal: true,
  query: `
    SELECT date, label, value
    FROM dbt.api_celo_gpay_retention_monthly
  `,
};
export default metric;
