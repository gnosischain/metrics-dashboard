const metric = {
  id: 'api_celo_gpay_settlement_fee_bps_monthly',
  name: 'Settlement Fee vs Volume',
  description: 'Bridge fee as bps of settled volume',
  metricDescription: `
  CELO bridge / LayerZero fee as basis points of settled USD volume that month
  (\`10000 × fee_usd / volume_usd\`).

  Early months can look extreme when volume is still tiny relative to a fixed
  per-tx bridge cost; the companion "Settlement Cost" card shows the absolute
  USD fee per charge without that scale distortion. Celo-only.
  `,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT toDate(month) AS date, fee_bps_of_volume AS value
    FROM dbt.api_celo_gpay_settlement_cost_monthly
    ORDER BY date
  `,
};
export default metric;
