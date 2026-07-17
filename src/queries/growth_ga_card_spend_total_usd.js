const metric = {
  "id": "growth_ga_card_spend_total_usd",
  "name": "GA card payments",
  "description": "All-time spend on GA-controlled cards",
  metricDescription: `Total all-time USD **card payments** (\`action='Payment'\`, actual merchant spend) on Gnosis-App-controlled Gnosis Pay cards. Sourced from the module-agnostic **GA-linked card set** (all architectures, post-migration cards included), with activity **canonicalized** (old→new Safe) and attributed from each card's GA-control-start (\`coalesce(first_ga_owner_at, first activity)\`) — so it no longer plateaus/declines like the DelayModule-only series did. This is the GA slice — NOT the all-Gnosis-Pay total (that lives on the gnosis-pay dashboard). The change badge is the % the cumulative total grew over the last 30 days. Unit: USD; the current incomplete day is excluded.`,
  "chartType": "numberDisplay",
  "format": "formatCurrencyCompact",
  "valueField": "value",
  "query": "SELECT toInt64(round(sum(spend_usd))) AS value, round(100.0 * sumIf(spend_usd, date >= today() - 30 AND date < today()) / nullIf(sumIf(spend_usd, date < today() - 30), 0), 2) AS change_pct FROM dbt.api_execution_gnosis_app_gp_card_ga_volume_daily WHERE date < today()"
};
export default metric;
