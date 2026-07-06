const metric = {
  "id": "growth_app_topup_by_campaign_weekly",
  "name": "App top-ups by campaign (funded proxy)",
  "description": "Attributed app top-ups per campaign x week",
  "metricDescription": "App card top-ups (the causally-attributable 'funded' proxy) credited to a UTM campaign, by week. Sparse by design: only the ~4-7% of conversions whose campaign touch preceded the top-up. 'unknown' excluded. Clipped to the Mixpanel era (>=2025-10).",
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
