const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_retention_1m",
  "name": "1-Month Retention (GT)",
  "description": "Recent cohorts, app-tagged",
  "metricDescription": `Average one-month retention of recent acquisition cohorts on the \`app_tagged\` basis. A wallet's cohort is the month of its first **app-tagged** day (\`is_app_tagged_day\` = a deliberate app-feature action: a swap, an auto-topup, or a \`MetriFee\`/\`PayTopUp\`/\`AutoTopup\` transfer — a plain \`MetriTransfer\` does not count), and \`retention_pct\` at \`month_index = 1\` is the share of that cohort active again one month later. Shown as a percentage, averaged over the last 6 cohorts (cohort month within the past 6 months); the denominator is the cohort's active-wallet size, never the raw registry.`,
  "chartType": "numberDisplay",
  "format": "formatPercentageInt",
  "valueField": "value",
  "query": "SELECT round(avg(retention_pct)*100,1) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_cohort_retention_monthly WHERE basis='app_tagged' AND month_index=1 AND cohort_month >= addMonths(toStartOfMonth(today()), -6)"
};
export default metric;
