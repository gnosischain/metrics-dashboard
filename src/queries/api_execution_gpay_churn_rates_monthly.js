const metric = {
  id: 'api_execution_gpay_churn_rates_monthly',
  name: 'Churn and Retention Rates',
  description: 'Monthly lifecycle rates',
  metricDescription: 'Monthly churn and retention rates. Filter by scope (Payment vs Any activity).',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatPercentageInt',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  enableFiltering: true,
  labelField: 'scope',
  query: `
    SELECT scope, toDate(month) AS date, 'Churn Rate' AS label, churn_rate AS value
    FROM dbt.api_execution_gpay_churn_rates_monthly

    UNION ALL

    SELECT scope, toDate(month) AS date, 'Retention Rate' AS label, retention_rate AS value
    FROM dbt.api_execution_gpay_churn_rates_monthly

    ORDER BY
      if(scope = 'Payment', 0, 1),
      date ASC,
      if(label = 'Churn Rate', 0, 1)
  `,
};

export default metric;
