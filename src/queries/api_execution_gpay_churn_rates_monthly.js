const metric = {
  id: 'api_execution_gpay_churn_rates_monthly',
  name: 'Churn and Retention Rates',
  description: 'Monthly lifecycle rates',
  metricDescription: `
  Monthly churn and retention rates 

  - __Churn rate:__ percentage of current month active users who are not active the following month
  - __Retention rate:__ percentage of the previous month active users who remain active in the current month
  
  Filter by scope: __Payment__ (card spend only) vs __Any__ (all activity types).
  `,
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
