const metric = {
  id: 'api_hopr_ticket_price_probability',
  name: 'Ticket Price & Win Probability',
  description: 'Jura, raw protocol parameters',
  metricDescription: 'Raw protocol parameters on jura. Both are tiny magnitudes (1e-05 / 4e-06) — the "Effective Ticket Value" chart carries the economically meaningful figure. Forward-only feed starting 2026-08-18; deeper history does not exist.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  query: `
    SELECT date, tpl.1 AS series, tpl.2 AS value
    FROM dbt.api_hopr_protocol_params_daily
    ARRAY JOIN [
      ('Ticket price (wxHOPR)', toFloat64(ifNull(ticket_price_wxhopr, 0))),
      ('Min win probability', min_ticket_winning_probability)
    ] AS tpl
    WHERE network = 'jura'
    ORDER BY date, series
  `,
};
export default metric;
