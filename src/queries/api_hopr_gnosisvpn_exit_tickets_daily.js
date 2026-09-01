const metric = {
  id: 'api_hopr_gnosisvpn_exit_tickets_daily',
  name: 'GnosisVPN Exit Activity',
  description: 'Tickets redeemed per day, by exit',
  metricDescription: 'Tickets redeemed per day by production GnosisVPN exit node. Exits are disjoint, so the stacked total is production VPN exit activity. HOPR\'s Dune counters read higher because they span the rotsee testnet and network-wide relayer redemptions (every hop redeems, not just exits).',
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  stacked: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'exit_label',
  query: `
    SELECT date, exit_label, toFloat64(sum(tickets_redeemed)) AS value
    FROM dbt.api_gnosisvpn_exit_activity_daily
    GROUP BY date, exit_label
    ORDER BY date, exit_label
  `,
};
export default metric;
