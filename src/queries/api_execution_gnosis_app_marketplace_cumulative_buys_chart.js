const metric = {
  id: 'api_execution_gnosis_app_marketplace_cumulative_buys_chart',
  name: 'Cumulative Buys by Offer',
  description: 'Daily cumulative — per offer',
  metricDescription: `Running cumulative total of **Gnosis App marketplace buys** per offer, plotted over a continuous daily spine (empty days back-filled so each offer's line stays monotonic). A **buy** is a \`PaymentReceived\` event on a Circles \`PaymentGateway\` relayed by an active Cometh ERC-4337 bundler where the \`payer\` is a known Gnosis App user; an **offer** is a named gateway from \`createGateway\`, minus those on the exclusion list. Each series is that offer's \`cumulative_buys\` through the date; the current in-progress day is excluded. \`count\``,
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
