const metric = {
  id: 'api_execution_circles_v2_trusts_daily',
  name: 'Daily Trusts',
  description: 'Trust event activity',
  metricDescription: 'Daily Circles v2 trust event flow: new trusts granted, trusts revoked, distinct trusters and trustees. Complements the active-trusts net-stock series.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'n_new_trusts',
  unitFields: {
    new_trusts:        { field: 'n_new_trusts',        format: 'formatNumber' },
    revoked_trusts:    { field: 'n_revoked_trusts',    format: 'formatNumber' },
    distinct_trusters: { field: 'n_distinct_trusters', format: 'formatNumber' },
    distinct_trustees: { field: 'n_distinct_trustees', format: 'formatNumber' },
  },
  query: `
    SELECT
      date,
      n_trust_events,
      n_new_trusts,
      n_revoked_trusts,
      n_distinct_trusters,
      n_distinct_trustees
    FROM dbt.api_execution_circles_v2_trusts_daily
    ORDER BY date
  `,
};
export default metric;
