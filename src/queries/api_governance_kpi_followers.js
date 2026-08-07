const metric = {
  id: 'api_governance_kpi_followers',
  name: 'Snapshot followers',
  description: 'Addresses following the gnosis.eth space',
  metricDescription: `Count of addresses following the \`gnosis.eth\` Snapshot space. Followers are not voters — many never cast a vote. Useful as a soft reach signal next to the unique-voter total.

Source: \`dbt.api_governance_kpis_latest\`.`,
  chartType: 'numberDisplay',
  variant: 'compact',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toUInt64(followers) AS value
    FROM dbt.api_governance_kpis_latest
  `,
};

export default metric;
