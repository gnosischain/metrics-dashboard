const metric = {
  id: 'api_execution_circles_v2_trusts_distribution',
  name: 'Trust Degree Distribution',
  description: 'Avatars grouped by trust degree, given vs received',
  metricDescription: 'Histogram of Circles v2 avatars by their trust degree, faceted into trusts given and trusts received. Bucket order: 0 / 1-5 / 6-10 / 11-25 / 26-50 / 51-100 / 100+.',
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  format: 'formatNumber',
  xField: 'trust_bucket',
  yField: 'avatar_count',
  seriesField: 'direction',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT direction, trust_bucket, avatar_count
    FROM dbt.api_execution_circles_v2_trusts_distribution
    ORDER BY direction, trust_bucket
  `,
};
export default metric;
