const metric = {
  id: 'api_hopr_kpi_vpn_mau',
  name: 'GnosisVPN MAU',
  description: 'Trailing 30 days',
  metricDescription: 'Monthly active GnosisVPN users: distinct clients active in the trailing 30-day window (jura, production). Reconciled exactly against HOPR\'s own Dune board (2026-09-01): replicating their SQL on our decoded events yields the identical total; their headline reads higher only because it includes the rotsee testnet, which this card deliberately excludes. Definition matches theirs: an edge client (key-bound, never announced) that redeemed a ticket as channel source or first key-bound in the window.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT toFloat64(argMax(active_users_30d, date)) AS value
    FROM dbt.api_hopr_gnosisvpn_users_daily
    WHERE network = 'jura'
  `,
};
export default metric;
