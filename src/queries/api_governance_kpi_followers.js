const metric = {
  id: 'api_governance_kpi_followers',
  name: 'Snapshot Followers',
  description: 'GnosisDAO space',
  metricDescription: 'Accounts following the GnosisDAO Snapshot space.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT followers AS value
    FROM dbt.api_governance_kpis_latest
  `,
};
export default metric;
