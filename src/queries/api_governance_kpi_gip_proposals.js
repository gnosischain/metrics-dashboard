const metric = {
  id: 'api_governance_kpi_gip_proposals',
  name: 'GIP proposals',
  description: 'Snapshot ballots tagged as GIPs',
  metricDescription: `Count of Snapshot proposals on \`gnosis.eth\` classified as GIPs (\`is_gip = 1\`). Distinct from \`total_gips\` (unique GIP numbers, which can span re-ballots) and from the all-proposal count, which includes non-GIP spam.

Source: \`dbt.api_governance_kpis_latest\`. Snapshot signaling only — not on-chain execution.`,
  chartType: 'numberDisplay',
  variant: 'compact',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toUInt64(total_gip_proposals) AS value
    FROM dbt.api_governance_kpis_latest
  `,
};

export default metric;
