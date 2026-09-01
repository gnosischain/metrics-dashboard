const metric = {
  id: 'api_hopr_jura_registrations',
  name: 'Jura: Node Registrations',
  description: 'Blokli feed, no liveness by design',
  metricDescription: 'Cumulative and daily-new node registrations on jura (blokli feed; history starts 2026-01). Jura has no liveness signal — the prober was never ported to v4 — so registrations are the only health series that exists for it.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  y2Series: ['New that day'],
  y1AxisName: 'cumulative',
  y2AxisName: 'new / day',
  query: `
    SELECT date, tpl.1 AS series, tpl.2 AS value
    FROM dbt.api_hopr_network_health_daily
    ARRAY JOIN [
      ('Registered (cumulative)', toFloat64(nodes_registered_cumulative)),
      ('New that day', toFloat64(nodes_registered_new))
    ] AS tpl
    WHERE network = 'jura'
    ORDER BY date, series
  `,
};
export default metric;
