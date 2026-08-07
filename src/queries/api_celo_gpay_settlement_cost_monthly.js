const metric = {
  id: 'api_celo_gpay_settlement_cost_monthly',
  name: 'Settlement Cost',
  description: 'CELO bridge fee USD per charge',
  metricDescription: `
  Average LayerZero / bridge CELO fee (in USD) per successful TokenPullSuccess
  in the month.

  Settlement is atomic (charge and outflow in the same transaction), so there is
  no float or lag series — only the fee paid to move value off Celo. See the
  companion "Fee bps of volume" card for the same fee relative to settled USD
  volume. Celo-only.
  `,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrency',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT toDate(month) AS date, fee_usd_per_charge AS value
    FROM dbt.api_celo_gpay_settlement_cost_monthly
    ORDER BY date
  `,
};
export default metric;
