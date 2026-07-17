const metric = {
  "id": "growth_ga_linked_cards_total",
  "name": "GA-linked GP cards",
  "description": "Total cards linked to a Gnosis App account",
  metricDescription: `Total distinct Gnosis Pay cards **linked to a Gnosis App (GA) account**, across all architectures and link signals (app profile / Mixpanel, Delay module, top-up funder, cashback). This is the module-agnostic superset of the frozen "GP Wallets on GA" count — it includes post-migration cards the DelayModule-only metric cannot see, so it keeps growing instead of plateauing. The change badge is the % it grew over the last 30 days. Unit: card count.

**Scope:** this and the funding/spend metrics share the same payment-gated "active cardholder" basis — a card counts once it has transacted, so deployed-but-never-spent GP cards are excluded from both. (The platform-wide "deployed Gnosis Pay accounts" metric counts those separately.)`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(sum(cum_now)) AS value, round(100.0 * (sum(cum_now) - sum(cum_prev)) / nullIf(sum(cum_prev), 0), 2) AS change_pct FROM (SELECT link_source, argMax(n_cards_cumulative, date) AS cum_now, argMaxIf(n_cards_cumulative, date, date <= today() - 30) AS cum_prev FROM dbt.api_execution_gnosis_app_gp_card_ga_link_daily GROUP BY link_source)"
};
export default metric;
