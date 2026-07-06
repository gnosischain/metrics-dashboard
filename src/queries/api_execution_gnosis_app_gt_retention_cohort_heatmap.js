const metric = {
  "id": "api_execution_gnosis_app_gt_retention_cohort_heatmap",
  "name": "Retention Cohorts (GT)",
  "description": "App-tagged activity cohorts \u00d7 months since",
  "metricDescription": "Ground-truth wallet retention: each row is a cohort (month of first app-tagged action), each column is months-since. % = share of the cohort active again; # = wallet count. Denominator is the cohort size.",
  "chartType": "heatmap",
  "xField": "x",
  "yField": "y",
  "valueField": "retention_pct",
  "format": "formatPercentageInt",
  "showLabels": true,
  "enableZoom": true,
  "visualMapOrient": "vertical",
  "unitFields": {
    "pct": {
      "field": "retention_pct",
      "format": "formatPercentageInt",
      "label": "%"
    },
    "val": {
      "field": "value_abs",
      "format": "formatNumber",
      "label": "#",
      "visualMapPercentile": true
    }
  },
  "unitFieldGroups": [
    {
      "options": {
        "pct": "%",
        "val": "#"
      }
    }
  ],
  "query": "SELECT toString(month_index) AS x, toString(cohort_month) AS y, round(retention_pct*100,1) AS retention_pct, toInt64(retained_wallets) AS value_abs FROM dbt.fct_execution_gnosis_app_gt_wallet_cohort_retention_monthly WHERE basis='app_tagged' ORDER BY y ASC, month_index ASC"
};
export default metric;
