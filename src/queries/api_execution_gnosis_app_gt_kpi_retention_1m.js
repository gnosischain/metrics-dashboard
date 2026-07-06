const metric = {
  "id": "api_execution_gnosis_app_gt_kpi_retention_1m",
  "name": "1-Month Retention (GT)",
  "description": "Recent cohorts, app-tagged",
  "metricDescription": "Average share of a wallet cohort that returns for an app-feature action one month after acquisition (recent 6 cohorts).",
  "chartType": "numberDisplay",
  "format": "formatPercentageInt",
  "valueField": "value",
  "query": "SELECT round(avg(retention_pct)*100,1) AS value FROM dbt.fct_execution_gnosis_app_gt_wallet_cohort_retention_monthly WHERE basis='app_tagged' AND month_index=1 AND cohort_month >= addMonths(toStartOfMonth(today()), -6)"
};
export default metric;
