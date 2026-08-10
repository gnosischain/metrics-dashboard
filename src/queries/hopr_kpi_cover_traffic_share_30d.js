const metric = {
  id: 'hopr_kpi_cover_traffic_share_30d',
  name: 'Cover traffic share',
  description: 'Last 30 days, both networks',
  chartType: 'numberDisplay',
  valueField: 'value',
  format: 'formatPercentage',
  metricDescription: `Share of the last 30 days' ticket redemptions, across both HOPR networks, where
the node paying for the relay is one of HOPR's own cover-traffic nodes.

Cover traffic is HOPR paying node runners in proportion to stake — a rewards programme that also
keeps the mixnet busy so real traffic is harder to single out. It is not user demand.

**This is a blend of two networks that behave in opposite ways, so read the movement carefully.**
On dufour essentially every redemption is cover traffic; on jura, none of it is — jura carries the
GnosisVPN client's real relay traffic and runs no cover traffic at all. The combined figure
therefore tracks **the mix between the two networks**, not a change in how much cover traffic HOPR
runs. If jura keeps growing this percentage falls, and that fall would mean jura gaining share, not
cover traffic being switched off.

The split chart below is the honest view; this number is a one-glance summary of it.`,
  query: `
    SELECT
      round(100 * sumIf(tickets_redeemed, is_cover_traffic = 1)
                / nullIf(sum(tickets_redeemed), 0), 1) AS value
    FROM dbt.api_hopr_channel_activity_daily
    WHERE date >= today() - INTERVAL 30 DAY
  `
};

export default metric;
