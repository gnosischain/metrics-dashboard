const metric = {
  id: 'api_hopr_new_registrations_daily',
  name: 'New Registrations',
  description: 'Daily, by network',
  metricDescription: 'Daily new node registrations by network (dufour + jura; rotsee excluded as testnet). Networks are disjoint, so the stacked total is all new registrations.',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  stacked: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'network',
  query: `
    SELECT date, network, toFloat64(nodes_registered_new) AS value
    FROM dbt.api_hopr_network_health_daily
    WHERE network IN ('dufour', 'jura') AND nodes_registered_new > 0
    ORDER BY date, network
  `,
};
export default metric;
