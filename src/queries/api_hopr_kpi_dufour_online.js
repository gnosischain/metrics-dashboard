const metric = {
  id: 'api_hopr_kpi_dufour_online',
  name: 'Dufour Nodes Online',
  description: 'Daily avg, last complete day',
  metricDescription: 'Daily average of online HOPR nodes on dufour, read from the last complete day (hours_observed >= 20 — the newest day is always partial). Liveness comes from the prober feed, which covers dufour only. Cross-checked 2026-09-01: network.hoprnet.org\'s own headline read exactly this figure.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toFloat64(argMax(nodes_online_avg, date)) AS value
    FROM dbt.api_hopr_network_health_daily
    WHERE network = 'dufour' AND hours_observed >= 20 AND nodes_online_avg IS NOT NULL
  `,
};
export default metric;
