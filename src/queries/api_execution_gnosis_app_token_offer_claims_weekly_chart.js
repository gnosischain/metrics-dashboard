const metric = {
  id: 'api_execution_gnosis_app_token_offer_claims_weekly_chart',
  name: 'Token Offer Claims',
  description: 'Weekly count and USD volume',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'n_claims',
  format: 'formatNumber',
  valueModeOptions: [
    { key: 'n_claims',            label: 'Claims',         valueField: 'n_claims',            format: 'formatNumber' },
    { key: 'n_claimers',          label: 'Claimers',       valueField: 'n_claimers',          format: 'formatNumber' },
    { key: 'volume_received_usd', label: 'Volume (USD)',   valueField: 'volume_received_usd', format: 'formatCurrency' },
    { key: 'volume_spent_crc',    label: 'Volume (CRC)',   valueField: 'volume_spent_crc',    format: 'formatNumber' },
  ],
  defaultValueMode: 'n_claims',
  query: `
    SELECT toDate(week) AS date, n_claims, n_claimers, volume_received_usd, volume_spent_crc
    FROM dbt.api_execution_gnosis_app_token_offer_claims_weekly
    ORDER BY date ASC
  `,
};
export default metric;
