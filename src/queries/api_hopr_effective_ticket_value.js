const metric = {
  id: 'api_hopr_effective_ticket_value',
  name: 'Effective Ticket Value',
  description: 'price / win probability, wxHOPR',
  metricDescription: 'ticket_price divided by min_ticket_winning_probability, in wxHOPR — what a winning ticket is actually worth. Cross-checks exactly against the protocol\'s payout_per_winning_ticket. Forward-only feed from 2026-08-18.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  query: `
    SELECT date, round(toFloat64(ticket_price_wxhopr) / min_ticket_winning_probability, 4) AS value
    FROM dbt.api_hopr_protocol_params_daily
    WHERE network = 'jura' AND ticket_price_wxhopr IS NOT NULL AND min_ticket_winning_probability > 0
    ORDER BY date
  `,
};
export default metric;
