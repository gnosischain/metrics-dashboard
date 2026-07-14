const metric = {
  "id": "api_execution_gnosis_app_gt_active_wallets_weekly",
  "name": "Active Wallets (WAU)",
  "description": "Any-action vs app-tagged",
  metricDescription: `Two ways to count the **same** app-engaged wallets each week (Monday-anchored) — shown together so you can see how much "active" depends on the definition. Both lines are drawn from the identical population: wallets that have ever done a deliberate app action (\`is_app_active\`), **not** the whole Circles avatar set. They differ only in what counts as activity that week:\n\n- **Any action** (\`active_wallets\`) — the wallet did *any* on-chain action that week: this includes plain peer-to-peer \`MetriTransfer\` sends, personal mints, hub transfers, trusts and invitations. The broad ceiling.\n- **App-tagged** (\`active_wallets_app_tagged\`) — the wallet did a *deliberate app-feature* action that week: a CoW/Metri swap, an auto-topup, or a \`MetriFee\`/\`PayTopUp\`/\`AutoTopup\` transfer. Passive P2P \`MetriTransfer\` sends are excluded.\n\nThe **gap** between the lines is app-engaged wallets whose weekly activity was only passive/P2P rather than a deliberate app feature — it is **not** a Gnosis Pay card-spend distinction. The current incomplete week is excluded. Unit: distinct wallet count.`,
  "chartType": "line",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT date, label, value FROM (SELECT period_start AS date, 'Any action' AS label, toInt64(active_wallets) AS value FROM dbt.fct_execution_gnosis_app_gt_active_wallets WHERE period_type='week' UNION ALL SELECT period_start AS date, 'App-tagged' AS label, toInt64(active_wallets_app_tagged) AS value FROM dbt.fct_execution_gnosis_app_gt_active_wallets WHERE period_type='week') ORDER BY date ASC, label ASC"
};
export default metric;
