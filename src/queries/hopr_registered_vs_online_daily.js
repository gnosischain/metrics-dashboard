const metric = {
  id: 'hopr_registered_vs_online_daily',
  name: 'Nodes registered vs nodes online',
  description: 'Cumulative on-chain registrations against nodes actually reachable',
  metricDescription: `Two different things on one axis, deliberately.

**Registered (cumulative)** counts every node that has ever bound a key on-chain. On-chain
registration never expires, so a machine that ran once in 2023 and vanished is still counted
today. It only goes up.

**Online (daily average)** is how many nodes the network dashboard actually saw responding,
averaged across the hours it observed that day.

The two have diverged every year the network has existed. Quoting the registration figure as
"network size" overstates the live network several times over — which is why both are drawn
here rather than one. Neither line alone answers "how big is HOPR".

Registrations cover both HOPR networks (dufour and jura). The online series is dufour only:
the prober that produces it was never ported to the v4 network, so jura liveness is
unmeasured rather than zero.

Source: \`dbt.api_hopr_network_health_daily\`.`,
  chartType: 'line',
  format: 'formatNumber',
  yField: 'value',
  seriesField: 'label',
  colors: ['#8C8C8C', '#3E6957'],
  isTimeSeries: true,
  enableZoom: true,
  query: `
    WITH daily AS (
      SELECT
        date,
        -- sum, not max: each network carries its own cumulative, so the ecosystem total is
        -- their sum. jura's series starts when it went live, which is a real step up in
        -- nodes ever registered, not an artefact.
        toInt64(sum(nodes_registered_cumulative)) AS registered,
        -- NULL rather than 0 where nothing was observed, so an unmeasured day renders as a
        -- gap instead of a crash to zero. sum() over all-NULL returns 0 in ClickHouse, so
        -- the emptiness has to be tested explicitly.
        if(countIf(nodes_online_avg IS NOT NULL) = 0,
           NULL,
           toInt64(round(sum(nodes_online_avg)))) AS online
      FROM dbt.api_hopr_network_health_daily
      WHERE date BETWEEN '{from}' AND '{to}'
      GROUP BY date
    )
    -- One row per series, not one column per series: the chart maps a single value column
    -- plus a label. seq only orders the series so colors[] lands on the intended line.
    SELECT date, label, value
    FROM (
      SELECT date, 'Registered' AS label, registered AS value, 1 AS seq FROM daily
      UNION ALL
      SELECT date, 'Online' AS label, online AS value, 2 AS seq FROM daily
    )
    ORDER BY date, seq
  `
};

export default metric;
