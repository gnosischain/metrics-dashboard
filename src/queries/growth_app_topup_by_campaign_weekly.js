const metric = {
  "id": "growth_app_topup_by_campaign_weekly",
  "name": "App top-ups by campaign (funded proxy)",
  "description": "Attributed app top-ups per campaign x week",
  metricDescription: `Weekly count of Gnosis App card **top-ups** (\`conversion_kind='topup'\`) credited to a UTM marketing campaign — the causally-attributable proxy for card funding. A top-up is credited to a campaign only under \`first_touch\` attribution and only when the campaign touch preceded it; touch-after events are recoded to \`unknown\` and excluded here. Sparse by design: only ~4-7% of in-era conversions carry a valid campaign, the rest are organic or untagged. Clipped to the Mixpanel era (weeks \`>= 2025-10-01\`), since earlier attributions would be back-stamped. Unit: count of new accounts (\`new_accounts\`) per campaign per week.`,
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT toString(week) AS date, utm_campaign AS label, toInt64(sum(new_accounts)) AS value FROM dbt.api_mixpanel_ga_growth_campaign_weekly WHERE conversion_kind='topup' AND utm_campaign != 'unknown' GROUP BY date, label ORDER BY date"
};
export default metric;
