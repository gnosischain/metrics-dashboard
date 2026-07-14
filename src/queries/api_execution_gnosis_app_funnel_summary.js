const metric = {
  id: 'api_execution_gnosis_app_funnel_summary',
  name: 'Conversion Funnel',
  description: 'Users reaching each funnel step',
  metricDescription: `For each conversion funnel, the number of distinct users (\`user_pseudonym\`) who reached at least each step — so the drop-off between adjacent bars is that step's conversion rate. The four funnels share the same later steps (\`chain.swap_filled\` then \`chain.topup\`) and differ only by entry point (step 1): \`chain.onboard\`, \`chain.token_offer_claim\`, \`mp.pageview\` (marketplace pageview), or \`mp.modal\`. Steps are matched with ClickHouse \`windowFunnel\` and must occur in the listed order; each user is credited with the furthest step they completed within a single day. Distinct-user counts, refreshed daily.`,
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  xField: 'step_label',
  yField: 'n_users',
  seriesField: 'funnel_name',
  preserveOrder: true,
  format: 'formatNumber',
  query: `
    SELECT funnel_name, step_label, level, n_users
    FROM dbt.api_execution_gnosis_app_funnel_summary
    ORDER BY level, funnel_name
  `,
};
export default metric;
