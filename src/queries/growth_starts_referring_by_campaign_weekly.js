const metric = {
  "id": "growth_starts_referring_by_campaign_weekly",
  "name": "Starts referring by campaign",
  "description": "Attributed referral starts per campaign x week",
  "metricDescription": `Weekly count of Gnosis App users hitting the \`starts_referring\` milestone — the first time an address appears as \`invited_by\` on a new Circles Human registration — credited to the UTM marketing campaign that acquired them, split by campaign. Attribution is **first-touch** only (one campaign per user, no double-counting) and **causally gated**: a campaign is credited only when its touch timestamp precedes the conversion, otherwise the touch is dropped to \`unknown\`; the untagged/organic \`unknown\` bucket is excluded here. Clipped to weeks >= 2025-10-01 (the Mixpanel-tracking era; earlier "attributions" would be back-stamped). Only about 4-7% of in-era conversions carry a causally valid campaign. Unit: new users (count) per campaign x week.`,
  "chartType": "bar",
  "isTimeSeries": true,
  "enableZoom": true,
  "xField": "date",
  "yField": "value",
  "seriesField": "label",
  "format": "formatNumber",
  "query": "SELECT toString(week) AS date, utm_campaign AS label, toInt64(sum(new_accounts)) AS value FROM dbt.api_mixpanel_ga_growth_campaign_weekly WHERE conversion_kind='starts_referring' AND utm_campaign != 'unknown' GROUP BY date, label ORDER BY date"
};
export default metric;
