const metric = {
  id: 'hopr_wxhopr_paid_daily',
  name: 'wxHOPR paid to relayers',
  description: 'Value actually redeemed out of payment channels, per day',
  metricDescription: `wxHOPR paid out to relaying nodes each day, split by whether the payer is one of
HOPR's own cover-traffic nodes.

Neither HOPR network emits a payout amount on redemption, so this is **reconstructed from channel
balance differences** — the drop in a channel's balance on a redemption event. Redemptions where
both endpoints of the diff were not observed contribute nothing rather than a wrong zero, so treat
this as a lower bound.

The cover-traffic share is the share HOPR is paying itself.

Source: \`dbt.api_hopr_channel_activity_daily\`.`,
  chartType: 'area',
  format: 'formatNumber',
  yField: 'value',
  seriesField: 'label',
  colors: ['#C9B037', '#3E6957'],
  isTimeSeries: true,
  enableZoom: true,
  query: `
    -- One row per series, not one column per series: the chart maps a single value column
    -- plus a label. seq only orders the series so colors[] lands on the intended band.
    SELECT date, label, value
    FROM (
      SELECT
        date,
        'Cover traffic' AS label,
        toFloat64(sumIf(redeemed_wxhopr, is_cover_traffic = 1)) AS value,
        1 AS seq
      FROM dbt.api_hopr_channel_activity_daily
      WHERE date BETWEEN '{from}' AND '{to}'
      GROUP BY date
      UNION ALL
      SELECT
        date,
        'Other traffic' AS label,
        toFloat64(sumIf(redeemed_wxhopr, is_cover_traffic = 0)) AS value,
        2 AS seq
      FROM dbt.api_hopr_channel_activity_daily
      WHERE date BETWEEN '{from}' AND '{to}'
      GROUP BY date
    )
    ORDER BY date, seq
  `
};

export default metric;
