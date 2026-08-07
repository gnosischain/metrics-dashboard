const metric = {
  id: 'hopr_tickets_cover_traffic_daily',
  name: 'Ticket redemptions: cover traffic vs the rest',
  description: 'Relay payments split by whether HOPR itself is paying',
  metricDescription: `Ticket redemptions per day, split by whether the node paying for the relay is one
of HOPR's own cover-traffic nodes.

**Cover traffic is HOPR paying node runners in proportion to stake** — a staking rewards programme,
not user demand. On the dufour network it accounts for nearly all channel activity, and the ten
addresses responsible are published by HOPR itself in its ct-research repository.

The split is the entire point of this chart. A single combined total would present a rewards
distribution schedule as if it were traffic. Tickets are used rather than channels opened because
channel churn is dominated by a 48-hour teardown-and-reopen cycle in the cover-traffic config,
which makes channel counts incomparable across years.

Source: \`dbt.api_hopr_channel_activity_daily\`.`,
  // 'bar' with stacked: true. There is no 'stackedBar' in the chart registry — it renders
  // as an "Unsupported chart type" message on the card.
  chartType: 'bar',
  stacked: true,
  format: 'formatNumber',
  yField: 'value',
  seriesField: 'label',
  seriesColorsByName: { 'Cover traffic': '#C9B037', 'Other traffic': '#3E6957' },
  isTimeSeries: true,
  enableZoom: true,
  query: `
    -- One row per series, not one column per series: the chart maps a single value column
    -- plus a label.
    SELECT date, label, value
    FROM (
      SELECT
        date,
        'Cover traffic' AS label,
        toInt64(sumIf(tickets_redeemed, is_cover_traffic = 1)) AS value,
        1 AS seq
      FROM dbt.api_hopr_channel_activity_daily
      WHERE date BETWEEN '{from}' AND '{to}'
      GROUP BY date
      UNION ALL
      SELECT
        date,
        'Other traffic' AS label,
        toInt64(sumIf(tickets_redeemed, is_cover_traffic = 0)) AS value,
        2 AS seq
      FROM dbt.api_hopr_channel_activity_daily
      WHERE date BETWEEN '{from}' AND '{to}'
      GROUP BY date
    )
    ORDER BY date, seq
  `
};

export default metric;
