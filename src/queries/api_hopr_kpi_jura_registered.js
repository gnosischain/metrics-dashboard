const metric = {
  id: 'api_hopr_kpi_jura_registered',
  name: 'Jura Nodes Registered',
  description: 'Cumulative registry',
  metricDescription: 'Cumulative registry count on jura (blokli feed). Jura has no liveness signal at all — the prober was never ported to v4 — so an "online" figure deliberately does not exist for it.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toFloat64(argMax(nodes_registered_cumulative, date)) AS value
    FROM dbt.api_hopr_network_health_daily
    WHERE network = 'jura'
  `,
};
export default metric;
