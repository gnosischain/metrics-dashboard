const metric = {
  id: 'api_celo_gpay_first_fund_by_channel',
  name: 'First Fund by Channel',
  description: 'Funded cards by first-fund shape',
  metricDescription: `
  How each __funded__ card on Celo got its first inbound transfer, by funding
  channel shape. Unfunded cards are excluded. One row per card (first fund only).

  Shape glossary (not funder identity):
  - __cip64_direct_solo__ — CIP-64 (tx type 123) + EOA \`transfer()\` + funder
    funds exactly one card (MiniPay-shaped; not a MiniPay identity label)
  - __other_direct__ — same call shape, non-CIP-64 envelope
  - __hub__ — funder funds 2+ cards
  - __mediated__ — not a direct EOA→token transfer (Safe / router)
  - __mixed__ / __unknown__ — relationship disagrees, or tx row missing

  CIP-64 alone is not MiniPay — most of Celo uses it. Celo-only.
  `,
  chartType: 'bar',
  isTimeSeries: false,
  horizontal: true,
  preserveOrder: true,
  xField: 'label',
  yField: 'value',
  format: 'formatNumber',
  barWidth: 'auto',
  barMaxWidth: 28,
  borderRadius: [0, 2, 2, 0],
  query: `
    SELECT
      concat(
        label,
        '  ',
        toString(round(100.0 * value / sum(value) OVER (), 1)),
        '%'
      ) AS label,
      toInt64(value) AS value
    FROM dbt.api_celo_gpay_first_fund_by_channel
    ORDER BY value DESC
  `,
};
export default metric;
