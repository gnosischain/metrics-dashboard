const metric = {
  id: 'api_execution_gpay_kpi_activity_monthly',
  name: 'Monthly User Activity',
  description: 'MAU by activity type',
  metricDescription: 'Monthly active users split into overall MAU and activity-specific MAU cohorts.',
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT toDate(month) AS date, 'MAU' AS label, mau AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Payment MAU' AS label, payment_mau AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Deposit MAU' AS label, deposit_mau AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Withdrawal MAU' AS label, withdrawal_mau AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Cashback MAU' AS label, cashback_mau AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    ORDER BY date ASC,
      multiIf(
        label = 'MAU', 1,
        label = 'Payment MAU', 2,
        label = 'Deposit MAU', 3,
        label = 'Withdrawal MAU', 4,
        label = 'Cashback MAU', 5,
        99
      )
  `,
};

export default metric;
