const metric = {
  id: 'api_governance_outcomes_latest',
  name: 'GIP outcomes',
  description: 'Closed GIP Snapshot ballots by outcome',
  metricDescription: `Distribution of GIP Snapshot ballot outcomes (\`is_gip = 1\` only). Non-GIP proposals are excluded — they are mostly spam and would dominate a below-quorum slice if included.

Source: \`dbt.api_governance_proposals_latest\`.`,
  chartType: 'pie',
  nameField: 'outcome',
  valueField: 'value',
  format: 'formatNumber',
  useAbbreviatedLabels: true,
  pieLabelValue: false,
  query: `
    SELECT
      outcome,
      toUInt64(count()) AS value
    FROM dbt.api_governance_proposals_latest
    WHERE is_gip = 1
    GROUP BY outcome
    ORDER BY value DESC
  `,
};

export default metric;
