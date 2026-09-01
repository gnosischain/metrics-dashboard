const metric = {
  id: 'api_hopr_kpi_effective_ticket_cost',
  name: 'Effective Ticket Value',
  description: 'wxHOPR, jura',
  metricDescription: 'ticket_price / min_ticket_winning_probability in wxHOPR — the economically meaningful figure (raw ticket price alone is meaningless across networks). Cross-checks exactly against the protocol\'s payout_per_winning_ticket. Jura only; the feed starts 2026-08-18.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT round(toFloat64(ticket_price_wxhopr) / min_ticket_winning_probability, 2) AS value
    FROM dbt.api_hopr_protocol_params_daily
    WHERE network = 'jura' AND ticket_price_wxhopr IS NOT NULL
    ORDER BY date DESC
    LIMIT 1
  `,
};
export default metric;
