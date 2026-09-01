const metric = {
  id: 'api_hopr_dufour_availability',
  name: 'Dufour Availability',
  description: '24h average, prober feed',
  metricDescription: 'Average 24h availability of probed dufour nodes. Prober feed — dufour only; days the prober missed are absent, not zero.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatPercentage',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, round(toFloat64(avg_availability_24h) * 100, 2) AS value
    FROM dbt.api_hopr_network_health_daily
    WHERE network = 'dufour' AND avg_availability_24h IS NOT NULL
    ORDER BY date
  `,
};
export default metric;
