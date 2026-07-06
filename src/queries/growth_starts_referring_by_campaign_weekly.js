const metric = {
  "id": "growth_starts_referring_by_campaign_weekly",
  "name": "Starts referring by campaign",
  "description": "Attributed referral starts per campaign x week",
  "metricDescription": "First on-chain referral milestone (invited_by appears on a new Circles Human registration) credited to a UTM campaign, by week. Causally gated + clipped to >=2025-10. 'unknown' excluded.",
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
