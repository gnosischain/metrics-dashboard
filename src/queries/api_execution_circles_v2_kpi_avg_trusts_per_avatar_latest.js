const metric = {
  id: 'api_execution_circles_v2_kpi_avg_trusts_per_avatar_latest',
  name: 'Avg Trusts / Human',
  description: 'Active trusts ÷ humans',
  metricDescription: `**Avg Trusts / Human** is a network-density indicator: the total number of currently-active trust relationships (\`active_trust_count_v2\`, every open directed trust edge in \`fct_execution_circles_v2_trust_relations_current\`) divided by the count of registered \`Human\` avatars (\`human_count_v2\`). Trust in Circles is directional, not necessarily mutual; the numerator counts edges from all avatar types (humans, groups, orgs) while the denominator counts humans only. Higher = a denser trust web. Rounded to 2 decimals.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value FROM dbt.api_execution_circles_v2_kpi_avg_trusts_per_avatar_latest`,
};
export default metric;
