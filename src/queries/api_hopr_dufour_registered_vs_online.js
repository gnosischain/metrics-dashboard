const metric = {
  id: 'api_hopr_dufour_registered_vs_online',
  name: 'Dufour: Registered vs Online',
  description: 'The gap is the story',
  metricDescription: 'Cumulative on-chain registry vs daily-average online nodes on dufour. The registry runs ~4x online because registrations never expire — the gap is the honest read, not an error. The online series exists only where the prober observed the day (prober is dufour-only).',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT * FROM (
      SELECT date, 'Registered (cumulative)' AS series, toFloat64(nodes_registered_cumulative) AS value
      FROM dbt.api_hopr_network_health_daily
      WHERE network = 'dufour'
      UNION ALL
      SELECT date, 'Online (daily avg)' AS series, toFloat64(nodes_online_avg) AS value
      FROM dbt.api_hopr_network_health_daily
      WHERE network = 'dufour' AND nodes_online_avg IS NOT NULL
    ) ORDER BY date, series
  `,
};
export default metric;
