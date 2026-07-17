const metric = {
  "id": "growth_ga_card_funded_usd_weekly",
  "name": "GA card funding (USD, weekly)",
  "description": "Money loaded onto GA-controlled cards",
  metricDescription: `Weekly USD **loaded onto** Gnosis-App-controlled Gnosis Pay cards — \`Fiat Top Up\` plus \`Crypto Deposit\` inflows (money added, not current balance; balance = inflows minus spend). Split by \`onboarding_class\`: \`onboarded_via_ga\` (the GP Safe's first owner was a Gnosis App user) vs \`imported\` (a GA owner was added to an existing GP Safe later). Scoped to GA-controlled wallets and counted only from the moment each wallet became GA-owned (\`first_ga_owner_at\`), so this is NOT the all-Gnosis-Pay total (that lives on the gnosis-pay dashboard). Unit: USD; the current incomplete week is excluded.`,
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "seriesColorsByName": { "Onboarded via GA": "#7B3FE4", "Imported": "#FF8A3D" },
  "format": "formatCurrency",
  "query": "SELECT toString(toStartOfWeek(date, 1)) AS date, multiIf(onboarding_class = 'onboarded_via_ga', 'Onboarded via GA', 'Imported') AS label, toInt64(round(sum(funded_volume_usd))) AS value FROM dbt.api_execution_gnosis_app_gpay_volume_daily WHERE date >= '2024-01-01' AND toStartOfWeek(date, 1) < toStartOfWeek(today(), 1) GROUP BY date, label ORDER BY date"
};
export default metric;
