const metric = {
  id: 'hopr_kpi_payout_per_ticket',
  name: 'Payout per winning ticket',
  chartType: 'numberDisplay',
  variant: 'compact',
  valueField: 'value',
  format: 'formatNumber',
  metricDescription: `What a winning ticket is worth in wxHOPR, on the jura network.

HOPR pays relayers **probabilistically**: a ticket wins with some probability and pays the ticket
price when it does. So the ticket price alone says nothing about relay economics, and comparing
ticket prices between networks running different winning probabilities is meaningless. This is
price divided by probability — the figure that is actually comparable.

jura only, from blokli. Forward-only series, so it reflects the most recent day ingested.`,
  query: `
    SELECT toFloat64(payout_per_winning_ticket_wxhopr) AS value
    FROM dbt.api_hopr_protocol_params_daily
    WHERE payout_per_winning_ticket_wxhopr IS NOT NULL
    ORDER BY date DESC
    LIMIT 1
  `,
};

export default metric;
