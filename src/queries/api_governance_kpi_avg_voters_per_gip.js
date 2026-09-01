const metric = {
  id: 'api_governance_kpi_avg_voters_per_gip',
  name: 'Avg Voters per GIP',
  description: 'Snapshot ballots',
  metricDescription: 'Average number of ballots per GIP Snapshot proposal (GIPs only). The median GIP has around 68 voters; the mean is pulled up by a few very large votes.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT round(avg_voters_per_gip_proposal, 0) AS value
    FROM dbt.api_governance_kpis_latest
  `,
};
export default metric;
