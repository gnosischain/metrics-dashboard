const metric = {
  id: 'hopr_committed_wxhopr_daily',
  name: 'wxHOPR committed to the network',
  description: 'Staked in Safes plus locked in open channels (jura)',
  metricDescription: `wxHOPR the network is holding: sitting in node staking Safes, plus locked inside
open payment channels. The closest thing HOPR has to a TVL, and it needs no balance indexing —
it comes straight from blokli, HOPR's own v4 indexer.

**jura only.** blokli has no endpoint for the older dufour network, and the rotsee testnet is
excluded because its balances are orders of magnitude away from production.

**The series is forward-only.** blokli is queried for the current day, so history begins when our
ingestion first ran and earlier days cannot be recovered. Expect a short series, and a gap for any
day the job did not run.

Source: \`dbt.api_hopr_protocol_params_daily\`.`,
  chartType: 'line',
  format: 'formatNumber',
  yField: 'value',
  seriesField: 'label',
  colors: ['#3E6957', '#8C8C8C'],
  isTimeSeries: true,
  // The series starts the day ingestion first ran, so it is routinely one or two points
  // long. A line through one point draws nothing, so the markers carry the chart.
  symbolSize: 7,
  query: `
    -- One row per series, not one column per series: the chart maps a single value column
    -- plus a label. seq only orders the series so colors[] lands on the intended line.
    SELECT date, label, value
    FROM (
      SELECT
        date,
        'In Safes' AS label,
        toFloat64(sum(safes_balance_wxhopr)) AS value,
        1 AS seq
      FROM dbt.api_hopr_protocol_params_daily
      WHERE date BETWEEN '{from}' AND '{to}'
      GROUP BY date
      UNION ALL
      SELECT
        date,
        'In open channels' AS label,
        toFloat64(sum(channels_open_balance_wxhopr)) AS value,
        2 AS seq
      FROM dbt.api_hopr_protocol_params_daily
      WHERE date BETWEEN '{from}' AND '{to}'
      GROUP BY date
    )
    ORDER BY date, seq
  `
};

export default metric;
