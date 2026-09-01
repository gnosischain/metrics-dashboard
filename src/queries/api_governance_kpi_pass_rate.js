const metric = {
  id: 'api_governance_kpi_pass_rate',
  name: 'GIP Pass Rate',
  description: 'Decided ballots',
  metricDescription: 'Share of decided GIP Snapshot ballots that passed. GIP-only: non-GIP Snapshot rows are mostly spam/phishing ballots at negligible turnout and would distort the rate.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatPercentage',
  valueField: 'value',
  query: `
    SELECT round(gip_pass_rate * 100, 1) AS value
    FROM dbt.api_governance_kpis_latest
  `,
};
export default metric;
