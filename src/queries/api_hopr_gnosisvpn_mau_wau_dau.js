const metric = {
  id: 'api_hopr_gnosisvpn_mau_wau_dau',
  name: 'GnosisVPN MAU / WAU / DAU',
  description: 'Trailing windows, production',
  metricDescription: 'Monthly / weekly / daily active GnosisVPN users — trailing 30d / 7d / 1d windows computed daily (jura, production). The windows overlap (30d contains 7d contains 1d), so these are lines, never a stack. Reconciled exactly against HOPR\'s own Dune board (2026-09-01): replicating their SQL on our decoded events matches their MAU to the client; their headline reads higher only because it includes the rotsee testnet, excluded here by design.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT date, tpl.1 AS series, tpl.2 AS value
    FROM dbt.api_hopr_gnosisvpn_users_daily
    ARRAY JOIN [
      ('MAU (30d)', toFloat64(active_users_30d)),
      ('WAU (7d)', toFloat64(active_users_7d)),
      ('DAU (1d)', toFloat64(active_users_1d))
    ] AS tpl
    WHERE network = 'jura'
    ORDER BY date, series
  `,
};
export default metric;
