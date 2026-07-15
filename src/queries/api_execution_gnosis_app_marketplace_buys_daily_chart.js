const metric = {
  id: 'api_execution_gnosis_app_marketplace_buys_daily_chart',
  name: 'Daily Buys by Offer',
  description: 'Daily buys — stacked by offer',
  metricDescription: `Daily number of **Gnosis App marketplace purchases**, stacked by offer. A **buy** is a \`PaymentReceived\` event on a Circles \`PaymentGateway\` whose paying transaction was relayed by an active Cometh ERC-4337 bundler and whose \`payer\` is a known Gnosis App user; each event counts once (\`n_buys\`). An **offer** is a named gateway created via \`createGateway\` (its \`name\`), excluding gateways on the marketplace exclusion list. Grain is one row per day per offer; the current in-progress day is excluded. Unit: buys (count).`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  xField: 'date',
  yField: 'n_buys',
  seriesField: 'label',
  format: 'formatNumber',
  showTotal: true,
  query: `
    SELECT toDate(date) AS date,
           offer_name AS label,
           n_buys
    FROM dbt.api_execution_gnosis_app_marketplace_buys_daily
    ORDER BY date ASC, label ASC
  `,
};
export default metric;
