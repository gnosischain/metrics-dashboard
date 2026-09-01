const metric = {
  id: 'api_hopr_nodes_by_country',
  name: 'Dufour Nodes by Country',
  description: 'Geo-resolved subset only',
  metricDescription: 'Top countries by dufour node count — resolved subset only: roughly 87% of dufour nodes have no geo resolution (country UNKNOWN; the ip_crawler HOPR source is not built yet), so these counts cover ~13% of the network. Read as a sample, not a census.',
  chartType: 'bar',
  isTimeSeries: false,
  horizontal: true,
  preserveOrder: true,
  format: 'formatNumber',
  xField: 'label',
  yField: 'value',
  query: `
    SELECT country_code AS label, toFloat64(nodes) AS value
    FROM dbt.api_hopr_nodes_by_country_latest
    WHERE network = 'dufour' AND country_code != 'UNKNOWN'
    ORDER BY value DESC
    LIMIT 12
  `,
};
export default metric;
