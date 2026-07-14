const metric = {
  id: 'api_celo_gpay_kpi_activity_monthly',
  name: 'Monthly User Activity',
  description: 'MAU by activity type',
  metricDescription: `
  Monthly active card Safes over time.

  - __MAU:__ all distinct active Safes.
  - __Payment MAU:__ Safes with card spend.
  - __Deposit MAU:__ Safes with top-ups.
  - __Withdrawal MAU:__ Safes with withdrawals.

  USDC/USDT only.
  `,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatNumber',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT toDate(month) AS date, 'MAU' AS label, mau AS value
    FROM dbt.api_celo_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Payment MAU' AS label, payment_mau AS value
    FROM dbt.api_celo_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Deposit MAU' AS label, deposit_mau AS value
    FROM dbt.api_celo_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Withdrawal MAU' AS label, withdrawal_mau AS value
    FROM dbt.api_celo_gpay_kpi_monthly

    ORDER BY date ASC,
      multiIf(
        label = 'MAU', 1,
        label = 'Payment MAU', 2,
        label = 'Deposit MAU', 3,
        label = 'Withdrawal MAU', 4,
        99
      )
  `,
};

export default metric;
