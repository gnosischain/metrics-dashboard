const metric = {
  "id": "growth_kpi_attributed_conversion_pct",
  "name": "Campaign-attributed app conversions (%)",
  "description": "Causally-valid campaign share",
  metricDescription: `Share of in-era Gnosis App conversions that carry a causally-valid UTM campaign — one whose marketing touch preceded the conversion under \`first_touch\` attribution. Pools all tracked milestones (\`topup\`, \`starts_referring\`, \`swap_filled\`, \`token_offer_claim\`) across all Mixpanel-era weeks (\`>= 2025-10-01\`). Only ~4-7% attribute; the rest are organic or untagged (\`utm_campaign='unknown'\`). GP-side funded / first_payment milestones are structurally un-attributable (~0.2%) and are reported as totals elsewhere, not here. Unit: percent of \`new_accounts\`.`,
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "query": "SELECT round(100.0 * sumIf(new_accounts, utm_campaign != 'unknown') / nullIf(sum(new_accounts), 0), 1) AS value FROM dbt.api_mixpanel_ga_growth_campaign_weekly"
};
export default metric;
