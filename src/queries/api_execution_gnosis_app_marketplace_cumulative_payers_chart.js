const metric = {
  id: 'api_execution_gnosis_app_marketplace_cumulative_payers_chart',
  name: 'Cumulative Payers by Offer',
  description: 'Daily cumulative distinct payers per offer',
  metricDescription: `Running total of distinct **payers** per curated Circles marketplace **offer**, by day. A payer is counted from the first day they bought from that offer, so each series only rises. A **buy** is a \`PaymentReceived\` event on the Circles v2 \`PaymentGatewayFactory\` where the payer is a known Gnosis App user and the transaction was relayed by an active Cometh ERC-4337 bundler (the app's on-chain fingerprint), mapped to a curated offer (offers/gateways blacklisted in \`gnosis_app_marketplace_offers_excluded\` are dropped). Counts start 2025-11-12; the current incomplete day is excluded. Unit: distinct addresses (count).`,
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
