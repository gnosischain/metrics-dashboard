const metric = {
  id: 'api_execution_gpay_kpi_flows_monthly',
  name: 'Monthly Financial KPIs',
  description: 'Payments, deposits, withdrawals, net flow',
  metricDescription: `
  Monthly financial aggregates:
   - __Payment Volume:__ card spend, 
   - __Deposits:__ fiat top-ups + crypto deposits, 
   - __Withdrawals:__ fiat off-ramps + crypto withdrawals
   - __Net Flow:__ deposits minus withdrawals. 
  
  All values in USD.
  `,
  chartType: 'line',
  isTimeSeries: true,
  enableZoom: true,
  format: 'formatCurrency',
  xField: 'date',
  yField: 'value',
  seriesField: 'label',
  query: `
    SELECT toDate(month) AS date, 'Payment Volume' AS label, total_payment_volume_usd AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Deposits' AS label, total_deposit_volume_usd AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Withdrawals' AS label, total_withdrawal_volume_usd AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    UNION ALL

    SELECT toDate(month) AS date, 'Net Flow' AS label, net_flow_usd AS value
    FROM dbt.api_execution_gpay_kpi_monthly

    ORDER BY date ASC,
      multiIf(
        label = 'Payment Volume', 1,
        label = 'Deposits', 2,
        label = 'Withdrawals', 3,
        label = 'Net Flow', 4,
        99
      )
  `,
};

export default metric;
