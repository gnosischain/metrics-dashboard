const metric = {
  id: 'api_execution_gnosis_app_kpi_gp_wallets_onboarded',
  name: 'Onboarded GP Wallets',
  description: 'Cumulative',
  metricDescription: `Cumulative count of Gnosis Pay cards that were first activated through the Gnosis App. A card is \`onboarded_via_ga\` when the very first owner module ever enabled on its Safe Delay Module was a **Gnosis App user** address (versus \`imported\`, where the first owner was some other address). Migrated old/new Safe pairs are collapsed to one \`canonical_address\`. A running total across all dates before today; a count of cards, not USD.

**Measurement limit (frozen ~June 5, 2026):** this count only includes cards onboarded under the old DelayModule architecture, where the Gnosis-App identity was recorded on-chain as a module owner. The June-2026 post-exploit migration moved cards to a RolesModule architecture in which the module owner is the user's own self-custody key and the app operates via a single shared controller (0x896a695d…) — so the Gnosis-App identity is no longer on-chain per card and post-migration cards can't be classified. Effectively frozen at the pre-migration total, not a real halt in onboarding.`,
  chartType: 'numberDisplay',
  format: 'formatNumber',
  valueField: 'value',
  query: `SELECT value, change_pct FROM dbt.api_execution_gnosis_app_kpi_gp_wallets_onboarded`,
};
export default metric;
