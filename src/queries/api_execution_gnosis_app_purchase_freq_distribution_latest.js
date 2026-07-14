const metric = {
  id: 'api_execution_gnosis_app_purchase_freq_distribution_latest',
  name: 'Purchase Frequency (30d)',
  description: 'Users by # of purchases in last 30 days',
  metricDescription: `Histogram of Gnosis App users by how many purchases they made in the rolling last 30 days (\`today()-30\` up to but excluding today). A **purchase** is a \`swap_filled\` or \`marketplace_buy\` activity event — the same definition used for the repeat-purchase-rate KPI; onboarding and other non-purchase actions are excluded. Users are bucketed by purchase count into \`1\` / \`2\` / \`3\` / \`4-5\` / \`6-10\` / \`11+\`, and only users with at least one purchase are counted. \`n_users\` is the number of distinct users in each bucket.`,
  chartType: 'bar',
  isTimeSeries: false,
  format: 'formatNumber',
  xField: 'bucket',
  yField: 'n_users',
  tooltipOrder: 'valueDesc',
  query: `
    SELECT bucket_order, bucket, n_users
    FROM dbt.api_execution_gnosis_app_purchase_freq_distribution_latest
    ORDER BY bucket_order
  `,
};
export default metric;
