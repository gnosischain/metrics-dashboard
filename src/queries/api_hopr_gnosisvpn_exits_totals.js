const metric = {
  id: 'api_hopr_gnosisvpn_exits_totals',
  name: 'GnosisVPN Exits by Tickets',
  description: 'All time, per exit',
  metricDescription: 'All-time tickets redeemed per production GnosisVPN exit node. Production roster verified identical to HOPR\'s authoritative client config (2026-09-01).',
  chartType: 'bar',
  isTimeSeries: false,
  horizontal: true,
  preserveOrder: true,
  format: 'formatNumber',
  xField: 'label',
  yField: 'value',
  query: `
    SELECT exit_label AS label, toFloat64(sum(tickets_redeemed)) AS value
    FROM dbt.api_gnosisvpn_exit_activity_daily
    GROUP BY exit_label
    ORDER BY value DESC
  `,
};
export default metric;
