const metric = {
  "id": "growth_ga_card_funded_usd_weekly",
  "name": "GA card funding (USD, weekly)",
  "description": "Money loaded onto GA-controlled cards",
  metricDescription: `Weekly USD **loaded onto** Gnosis-App-controlled Gnosis Pay cards — \`Fiat Top Up\` plus \`Crypto Deposit\` inflows (money added, not current balance; balance = inflows minus spend). Split by **link source** (how the card is known to be GA-linked): app profile (Mixpanel), Delay module (legacy), top-up funder, cashback. Sourced from the module-agnostic all-architectures GA-linked card set with activity **canonicalized** (old→new Safe) and counted from each card's GA-control-start (\`coalesce(first_ga_owner_at, first activity)\`), so it no longer declines post-migration. NOT the all-Gnosis-Pay total (that lives on the gnosis-pay dashboard). Unit: USD; the current incomplete week is excluded.`,
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "showTotal": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "seriesColorsByName": { "App profile (Mixpanel)": "#7B3FE4", "Delay module (legacy)": "#4C1D95", "Top-up funder": "#FF8A3D", "Cashback": "#F59E0B" },
  "format": "formatCurrency",
  "query": "SELECT toString(toStartOfWeek(date, 1)) AS date, multiIf(link_source = 'mixpanel_pay', 'App profile (Mixpanel)', link_source = 'delay_module', 'Delay module (legacy)', link_source = 'topup_funder', 'Top-up funder', link_source = 'cashback', 'Cashback', link_source) AS label, toInt64(round(sum(funded_volume_usd))) AS value FROM dbt.api_execution_gnosis_app_gp_card_ga_volume_daily WHERE date >= '2024-01-01' GROUP BY date, label ORDER BY date"
};
export default metric;
