const metric = {
  id: 'hopr_kpi_nodes_online',
  name: 'Nodes online',
  description: 'dufour, latest observed day',
  chartType: 'numberDisplay',
  variant: 'compact',
  valueField: 'value',
  format: 'formatNumberCompact',
  changeData: {
    enabled: true,
    field: 'change_pct',
    period: 'vs 30d ago',
  },
  metricDescription: `Nodes the network dashboard actually saw responding, averaged over the hours it observed on the most recent day with data.

This is the live network size. It is NOT the number of nodes ever registered on-chain, which is several times larger because registration never expires. dufour only — the prober behind this figure was never ported to the v4 network.`,
  query: `
    WITH bounds AS (
      SELECT max(date) AS max_date
      FROM dbt.api_hopr_network_health_daily
      WHERE network = 'dufour'
        AND nodes_online_avg IS NOT NULL
    ),
    latest AS (
      SELECT toInt64(round(h.nodes_online_avg)) AS value
      FROM dbt.api_hopr_network_health_daily AS h
      CROSS JOIN bounds AS b
      WHERE h.network = 'dufour'
        AND h.date = b.max_date
    ),
    prior AS (
      SELECT toInt64(round(h.nodes_online_avg)) AS value
      FROM dbt.api_hopr_network_health_daily AS h
      CROSS JOIN bounds AS b
      WHERE h.network = 'dufour'
        AND h.nodes_online_avg IS NOT NULL
        AND h.date <= b.max_date - INTERVAL 30 DAY
      ORDER BY h.date DESC
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
