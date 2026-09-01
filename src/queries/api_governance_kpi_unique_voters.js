const metric = {
  id: 'api_governance_kpi_unique_voters',
  name: 'Unique Voters',
  description: 'All time',
  metricDescription: 'Distinct addresses that ever cast a Snapshot vote in the GnosisDAO space.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT unique_voters AS value
    FROM dbt.api_governance_kpis_latest
  `,
};
export default metric;
