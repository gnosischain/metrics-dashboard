const metric = {
  id: 'api_governance_kpi_unique_voters',
  name: 'Unique voters',
  description: 'Distinct addresses that have cast a Snapshot vote',
  metricDescription: `Lifetime distinct voter addresses across all \`gnosis.eth\` Snapshot votes ingested. Lifetime count — not a monthly active figure. For participation trends that separate people from capital, use the Electorate chart.

Source: \`dbt.api_governance_kpis_latest\`.`,
  chartType: 'numberDisplay',
  variant: 'compact',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toUInt64(unique_voters) AS value
    FROM dbt.api_governance_kpis_latest
  `,
};

export default metric;
