const metric = {
  id: 'api_governance_gip_funnel',
  name: 'GIP conversion funnel',
  description: 'Discussed → Snapshot vote → passed or enacted',
  metricDescription: `Nested GIP conversion stages: discussed on the forum, reached a Snapshot vote, and passed or enacted (\`has_passed\` or \`has_decided\`). Stages are cumulative subsets — each bar is a subset of the one above it.

Source: \`dbt.api_governance_gip_funnel\`.`,
  chartType: 'bar',
  isTimeSeries: false,
  stacked: false,
  xField: 'stage',
  yField: 'value',
  preserveOrder: true,
  format: 'formatNumber',
  query: `
    SELECT
      stage,
      toUInt64(gip_count) AS value
    FROM dbt.api_governance_gip_funnel
    ORDER BY
      multiIf(
        stage = 'Discussed on forum', 1,
        stage = 'Reached Snapshot vote', 2,
        stage = 'Passed or enacted', 3,
        9
      )
  `,
};

export default metric;
