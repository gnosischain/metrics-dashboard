const metric = {
  id: 'api_hopr_ticket_price_probability',
  name: 'Ticket Price & Win Probability',
  description: 'Jura protocol parameters',
  metricDescription: 'Protocol parameters on jura, in readable units: ticket price in micro-wxHOPR (µwxHOPR, one millionth of a wxHOPR) on the left axis, minimum winning probability in tickets-per-million on the right axis. Feed starts 2026-08-18.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'series',
  y2Series: ['Win probability'],
  y1AxisName: 'µwxHOPR',
  y2AxisName: 'per million',
  query: `
    SELECT date, tpl.1 AS series, tpl.2 AS value
    FROM dbt.api_hopr_protocol_params_daily
    ARRAY JOIN [
      ('Ticket price (µwxHOPR)', round(toFloat64(ifNull(ticket_price_wxhopr, 0)) * 1e6, 3)),
      ('Win probability (per million)', round(min_ticket_winning_probability * 1e6, 3))
    ] AS tpl
    WHERE network = 'jura'
    ORDER BY date, series
  `,
};
export default metric;
