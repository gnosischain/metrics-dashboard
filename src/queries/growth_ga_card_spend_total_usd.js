const metric = {
  "id": "growth_ga_card_spend_total_usd",
  "name": "GA card payments (USD, total)",
  "description": "All-time spend on GA-controlled cards",
  metricDescription: `Total all-time USD **card payments** (\`action='Payment'\`, actual merchant spend) on Gnosis-App-controlled Gnosis Pay cards. Scoped to GA-controlled wallets and counted only from each card's \`first_ga_owner_at\` onward, so this is the GA slice — NOT the all-Gnosis-Pay total (that lives on the gnosis-pay dashboard). The change badge is the % the cumulative total grew over the last 30 days. Unit: USD; the current incomplete day is excluded.`,
  "chartType": "numberDisplay",
  "format": "formatCurrencyCompact",
  "valueField": "value",
  "query": "SELECT toInt64(round(sum(spend_usd))) AS value, round(100.0 * sumIf(spend_usd, date >= today() - 30 AND date < today()) / nullIf(sumIf(spend_usd, date < today() - 30), 0), 2) AS change_pct FROM dbt.api_execution_gnosis_app_gpay_volume_daily WHERE date < today()"
};
export default metric;
