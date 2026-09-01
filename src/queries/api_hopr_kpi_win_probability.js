const metric = {
  id: 'api_hopr_kpi_win_probability',
  name: 'Win Probability',
  description: 'Tickets per million, jura',
  metricDescription: 'Current minimum ticket winning probability on jura, expressed as winning tickets per million. Lower probability means each winning ticket is worth proportionally more (see Effective Ticket Value).',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatNumber',
  valueField: 'value',
  query: `
    SELECT round(min_ticket_winning_probability * 1e6, 2) AS value
    FROM dbt.api_hopr_protocol_params_daily
    WHERE network = 'jura'
    ORDER BY date DESC
    LIMIT 1
  `,
};
export default metric;
