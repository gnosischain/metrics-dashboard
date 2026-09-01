const metric = {
  id: 'api_hopr_kpi_ticket_price',
  name: 'Ticket Price',
  description: 'µwxHOPR, jura',
  metricDescription: 'Current ticket price on jura, in micro-wxHOPR (one millionth of a wxHOPR). Raw value is tiny by design; the meaningful economics live in the Effective Ticket Value (price / win probability).',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT round(toFloat64(ticket_price_wxhopr) * 1e6, 2) AS value
    FROM dbt.api_hopr_protocol_params_daily
    WHERE network = 'jura' AND ticket_price_wxhopr IS NOT NULL
    ORDER BY date DESC
    LIMIT 1
  `,
};
export default metric;
