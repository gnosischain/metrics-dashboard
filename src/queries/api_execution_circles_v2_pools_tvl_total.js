const metric = {
  id: 'api_execution_circles_v2_pools_tvl_total',
  name: 'Total TVL (est.)',
  metricDescription: `**Estimated total value locked** across the three main Circles DEX pools (s-CBG/sDAI, s-gCRC/sDAI, EURe/s-gCRC on Uniswap V3), in USD. Computed self-contained: each pool's token reserves are reconstructed from Uniswap V3 event deltas (validated within ~0.1% of on-chain \`balanceOf\`) and valued with — for the CRC legs (s-gCRC, s-CBG) — a 30-day USD VWAP from the pools' own trades, and for the stablecoin legs (sDAI, EURe) the oracle price. It matches external references (e.g. oku.trade shows the s-gCRC/sDAI pool at ~$31.6k). Marked "est." because the fully-exact, auto-updating daily version (on-chain balances for the inflationary CRC tokens) is still a follow-up. Sum of the latest per-pool TVL.`,
  format: 'formatCurrency',
  valueField: 'value',
  chartType: 'numberDisplay',
  query: `SELECT round(sum(tvl_usd), 2) AS value FROM dbt.api_execution_circles_v2_pools_latest`,
};
export default metric;
