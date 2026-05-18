const metric = {
  id: 'api_execution_gnosis_app_marketplace_cumulative_buys_chart',
  name: 'Cumulative Buys by Offer',
  description: 'Daily cumulative — per offer',
  metricDescription: 'Running total of Gnosis App marketplace buys per curated offer, matching the Dune dashboard Cumulative Buys window aggregate.',
  chartType: 'line',
  isTimeSeries: true,
  xField: 'date',
  yField: 'cumulative_buys',
  seriesField: 'label',
  format: 'formatNumber',
  query: `
    SELECT toDate(date) AS date,
           offer_name AS label,
           cumulative_buys
    FROM dbt.api_execution_gnosis_app_marketplace_buys_cumulative_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
