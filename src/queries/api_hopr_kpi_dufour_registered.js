const metric = {
  id: 'api_hopr_kpi_dufour_registered',
  name: 'Dufour Nodes Registered',
  description: 'Cumulative registry',
  metricDescription: 'Cumulative on-chain registry count on dufour. The registry runs roughly 4x the online count — never quote it as network size; read it against the "Dufour Nodes Online" card.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toFloat64(argMax(nodes_registered_cumulative, date)) AS value
    FROM dbt.api_hopr_network_health_daily
    WHERE network = 'dufour'
  `,
};
export default metric;
