const metric = {
  id: 'api_execution_circles_v2_pool_explorer_activity_daily',
  name: 'Pool Activity (daily)',
  description: 'Trading and liquidity activity for the selected pool over time',
  metricDescription: `Daily activity in the selected pool, with a metric toggle. **Volume (USD)** is the USD value of every swap; **Swaps** counts Swap events; **Traders** counts distinct takers (Swap recipient, falling back to the tx signer). **Liquidity Events** and **Liquidity (USD)** net Uniswap V3 liquidity actions per day — \`Mint\` (add) is **positive**, \`Burn\` (remove) is **negative** — as an event count and as the USD value of the tokens added/removed, so bars above the axis are net liquidity added and bars below are net removed (per-event amounts, USD and LP are in the Liquidity Events table below). The current incomplete day is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  enableZoom: true,
  xField: 'date',
  yField: 'volume_usd',
  format: 'formatCurrency',
  // Paint below-zero bars red (net liquidity removed). No-op for the all-positive
  // Volume/Swaps/Traders modes; only the Liquidity Events / Liquidity (USD) modes
  // ever go negative.
  negativeColor: '#ef4444',
  valueModeOptions: [
    { key: 'volume_usd',  label: 'Volume (USD)',     valueField: 'volume_usd',  format: 'formatCurrency' },
    { key: 'n_swaps',     label: 'Swaps',            valueField: 'n_swaps',     format: 'formatNumber' },
    { key: 'n_traders',   label: 'Traders',          valueField: 'n_traders',   format: 'formatNumber' },
    { key: 'liq_net',     label: 'Liquidity Events', valueField: 'liq_net',     format: 'formatNumber' },
    { key: 'liq_net_usd', label: 'Liquidity (USD)',  valueField: 'liq_net_usd', format: 'formatCurrency' },
  ],
  defaultValueMode: 'volume_usd',
  globalFilterField: 'pool_address',

  query: `
    SELECT
      date,
      round(coalesce(volume_usd, 0), 2)                       AS volume_usd,
      coalesce(n_swaps, 0)                                    AS n_swaps,
      coalesce(n_traders, 0)                                  AS n_traders,
      coalesce(liq_adds, 0) - coalesce(liq_removes, 0)        AS liq_net,
      round(coalesce(liq_usd_add, 0) - coalesce(liq_usd_remove, 0), 2) AS liq_net_usd
    FROM (
      SELECT
        d.date          AS date,
        d.pool_address  AS pool_address,
        sw.volume_usd   AS volume_usd,
        sw.n_swaps      AS n_swaps,
        sw.n_traders    AS n_traders,
        lq.liq_adds     AS liq_adds,
        lq.liq_removes  AS liq_removes,
        lq.liq_usd_add    AS liq_usd_add,
        lq.liq_usd_remove AS liq_usd_remove
      FROM (
        SELECT DISTINCT date, pool_address FROM (
          SELECT date, pool_address FROM dbt.api_execution_circles_v2_pool_explorer_swaps_daily
          UNION DISTINCT
          SELECT toDate(ts) AS date, pool_address FROM dbt.api_execution_circles_v2_pool_explorer_liquidity_events
          WHERE toDate(ts) < today()
        )
      ) d
      LEFT JOIN dbt.api_execution_circles_v2_pool_explorer_swaps_daily sw
        ON sw.date = d.date AND sw.pool_address = d.pool_address
      LEFT JOIN (
        SELECT toDate(ts) AS date, pool_address,
          countIf(event_kind = 'Add')              AS liq_adds,
          countIf(event_kind = 'Remove')           AS liq_removes,
          sumIf(amount_usd, event_kind = 'Add')    AS liq_usd_add,
          sumIf(amount_usd, event_kind = 'Remove') AS liq_usd_remove
        FROM dbt.api_execution_circles_v2_pool_explorer_liquidity_events
        WHERE toDate(ts) < today()
        GROUP BY date, pool_address
      ) lq ON lq.date = d.date AND lq.pool_address = d.pool_address
    ) t
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY date
  `,
};

export default metric;
