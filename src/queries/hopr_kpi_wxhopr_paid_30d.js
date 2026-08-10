const metric = {
  id: 'hopr_kpi_wxhopr_paid_30d',
  name: 'Paid to relayers',
  description: 'Last 30 days, both networks',
  chartType: 'numberDisplay',
  valueField: 'value',
  format: 'formatNumberWithWXHOPR',
  metricDescription: `wxHOPR redeemed out of payment channels by relaying nodes over the last 30 days,
across both networks and both traffic types.

Reconstructed from channel balance differences, because neither HOPR network emits a payout amount
on redemption. Redemptions where both ends of the difference were not observed contribute nothing
rather than a wrong zero, so read this as a lower bound.

Most of it is cover traffic — see the share beside it.`,
  query: `
    SELECT toFloat64(sum(redeemed_wxhopr)) AS value
    FROM dbt.api_hopr_channel_activity_daily
    WHERE date >= today() - INTERVAL 30 DAY
  `
};

export default metric;
