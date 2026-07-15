const metric = {
  id: 'api_execution_circles_v2_pools_activity_daily',
  name: 'Pool Activity (daily)',
  description: 'Volume, swaps or traders per pool over time',
  metricDescription: `Daily trading activity in the main Circles DEX pools (Uniswap V3 + Balancer V3), stacked by pool, with a metric toggle. **Volume (USD)** is the USD value of every swap (priced via the sDAI/EURe leg); **Swaps** counts Swap events; **Traders** counts distinct takers (Swap recipient, falling back to the tx signer) per pool per day. Pools: **s-CBG/sDAI**, **s-gCRC/sDAI**, **EURe/s-gCRC**, **s-gCRC/sDAI (Balancer)**. The current incomplete day is excluded.`,
  chartType: 'bar',
  isTimeSeries: true,
  stacked: true,
  enableZoom: true,
  xField: 'date',
  yField: 'volume_usd',
  seriesField: 'pool',
  labelField: 'pool',
  format: 'formatCurrency',
  showTotal: true,
  tooltipOrder: 'valueDesc',
  valueModeOptions: [
    { key: 'volume_usd',       label: 'Volume (USD)', valueField: 'volume_usd',       format: 'formatCurrency' },
    { key: 'swap_count',       label: 'Swaps',        valueField: 'swap_count',       format: 'formatNumber' },
    { key: 'distinct_traders', label: 'Traders',      valueField: 'distinct_traders', format: 'formatNumber' },
  ],
  defaultValueMode: 'volume_usd',
  query: `
    SELECT
      d.date                         AS date,
      d.pool                         AS pool,
      round(d.volume_usd, 2)         AS volume_usd,
      d.swap_count                   AS swap_count,
      coalesce(t.distinct_traders, 0) AS distinct_traders
    FROM dbt.api_execution_circles_v2_pools_daily d
    LEFT JOIN dbt.api_execution_circles_v2_pools_traders_daily t
      ON t.date = d.date AND t.pool = d.pool
    WHERE d.volume_usd > 0 OR d.swap_count > 0
    ORDER BY d.date
  `,
};
export default metric;
