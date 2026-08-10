const metric = {
  id: 'hopr_kpi_nodes_registered',
  name: 'Nodes ever registered',
  description: 'dufour, cumulative',
  chartType: 'numberDisplay',
  variant: 'compact',
  valueField: 'value',
  format: 'formatNumberCompact',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 30d ago',
  },
  metricDescription: `Nodes that have ever bound a key on-chain, across both HOPR networks, cumulative.

Deliberately NOT labelled "network size". On-chain registration never expires, so this includes every machine that ran once and disappeared, and it can only go up. Compare it against nodes online — the gap has widened every year.`,
  query: `
    WITH daily AS (
      SELECT
        date,
        toInt64(sum(nodes_registered_cumulative)) AS value
      FROM dbt.api_hopr_network_health_daily
      -- dufour, matching the chart beside it. Unscoped this summed both networks, so it read
      -- 1,219 on days jura had a spine row and 1,169 on days it did not -- a KPI that
      -- disagrees with its own chart on some days and not others.
      WHERE network = 'dufour'
      GROUP BY date
    ),
    bounds AS (
      SELECT max(date) AS max_date FROM daily
    ),
    latest AS (
      SELECT d.value
      FROM daily AS d
      CROSS JOIN bounds AS b
      WHERE d.date = b.max_date
    ),
    prior AS (
      SELECT d.value
      FROM daily AS d
      CROSS JOIN bounds AS b
      WHERE d.date <= b.max_date - INTERVAL 30 DAY
      ORDER BY d.date DESC
      LIMIT 1
    )
    SELECT
      (SELECT value FROM latest) AS value,
      if(
        (SELECT value FROM prior) IS NULL OR (SELECT value FROM prior) = 0,
        NULL,
        round(
          ((SELECT value FROM latest) - (SELECT value FROM prior))
          / abs((SELECT value FROM prior)) * 100,
          2
        )
      ) AS change_pct
  `,
};

export default metric;
