const metric = {
  id: 'api_hopr_protocol_params',
  name: 'Protocol Parameters',
  description: 'Current values, jura',
  metricDescription: 'The current jura protocol parameters and network capital in one place. Parameters have been constant since the feed started (2026-08-18) — a table states them honestly where a flat line chart would just draw a horizontal line. Effective ticket value = price / win probability, and cross-checks the protocol\'s own payout parameter exactly.',
  chartType: 'table',
  minimal: true,
  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    responsiveLayout: 'collapse',
    height: 400,
    selectableRows: false,
    columns: [
      { title: 'Parameter', field: 'parameter', minWidth: 240, sorter: 'string', formatter: 'plaintext' },
      { title: 'Value', field: 'value', width: 140, sorter: 'number', hozAlign: 'right' },
      { title: 'Unit', field: 'unit', width: 160, sorter: 'string', formatter: 'plaintext' },
    ],
  },
  query: `
    SELECT tpl.1 AS parameter, tpl.2 AS value, tpl.3 AS unit
    FROM (
      SELECT * FROM dbt.api_hopr_protocol_params_daily WHERE network = 'jura' ORDER BY date DESC LIMIT 1
    )
    ARRAY JOIN [
      ('Ticket price', round(toFloat64(ifNull(ticket_price_wxhopr, 0)) * 1e6, 3), 'µwxHOPR'),
      ('Min winning probability', round(min_ticket_winning_probability * 1e6, 3), 'per million'),
      ('Effective ticket value', round(toFloat64(ifNull(ticket_price_wxhopr, 0)) / min_ticket_winning_probability, 2), 'wxHOPR'),
      ('Payout per winning ticket', round(toFloat64(ifNull(payout_per_winning_ticket_wxhopr, 0)), 2), 'wxHOPR'),
      ('Key binding fee', round(toFloat64(ifNull(key_binding_fee_wxhopr, 0)), 2), 'wxHOPR'),
      ('Channel closure grace period', toFloat64(channel_closure_grace_period_s), 'seconds'),
      ('Accounts', toFloat64(account_count), 'accounts'),
      ('Safes', toFloat64(safes_count), 'safes'),
      ('Total wxHOPR committed', round(toFloat64(ifNull(total_wxhopr_committed, 0)), 0), 'wxHOPR')
    ] AS tpl
  `,
};
export default metric;
