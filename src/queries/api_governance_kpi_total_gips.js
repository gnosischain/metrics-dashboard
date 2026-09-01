const metric = {
  id: 'api_governance_kpi_total_gips',
  name: 'Total GIPs',
  description: 'All time',
  metricDescription: 'All GIP-numbered proposals ever created, on the forum and/or Snapshot. GIPs are the formal Gnosis Improvement Proposals; non-GIP Snapshot ballots (largely spam/phishing) are excluded from every governance metric on this dashboard.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT total_gips AS value
    FROM dbt.api_governance_kpis_latest
  `,
};
export default metric;
