const metric = {
  id: 'api_execution_gnosis_app_marketplace_cumulative_payers_chart',
  name: 'Cumulative Payers by Offer',
  description: 'Daily cumulative distinct payers per offer',
  metricDescription: 'Running total of distinct Gnosis App payers per curated offer. Matches the Dune dashboard Cumulative Users window aggregate.',
  chartType: 'line',
  isTimeSeries: true,
  xField: 'date',
  yField: 'cumulative_payers',
  seriesField: 'label',
  format: 'formatNumber',
  query: `
    SELECT toDate(date) AS date,
           offer_name AS label,
           cumulative_payers
    FROM dbt.api_execution_gnosis_app_marketplace_buys_cumulative_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
