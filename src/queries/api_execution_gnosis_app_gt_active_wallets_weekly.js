const metric = {
  "id": "api_execution_gnosis_app_gt_active_wallets_weekly",
  "name": "Active Wallets (WAU)",
  "description": "Any-action vs app-tagged",
  "metricDescription": "Weekly active app-engaged wallets. 'Any action' = any on-chain action; 'App-tagged' = a deliberate app-feature action (swap/fee/top-up), comparable to the heuristic active-user series. DAU/MAU also available in the underlying table.",
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
