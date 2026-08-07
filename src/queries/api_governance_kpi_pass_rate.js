const metric = {
  id: 'api_governance_kpi_pass_rate',
  name: 'GIP pass rate',
  description: 'Passed / (passed + rejected + no consensus + below quorum)',
  metricDescription: `Share of closed GIP Snapshot ballots that passed. Denominator is passed + rejected + no_consensus + below_quorum; selection-style \`decided\` outcomes are excluded. Unit: percent.

Source: \`dbt.api_governance_kpis_latest\`. Snapshot signaling only — not on-chain execution.`,
  chartType: 'numberDisplay',
  variant: 'compact',
  format: 'formatPercentage',
  valueField: 'value',
  query: `
    SELECT round(gip_pass_rate * 100, 1) AS value
    FROM dbt.api_governance_kpis_latest
  `,
};

export default metric;
