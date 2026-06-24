const metric = {
  id: 'api_execution_yields_user_kpi_total_lp_fees',
  name: 'LP Fees Collected',
  description: 'Lifetime (USD)',
  metricDescription: 'Total LP swap fees for the selected wallet. Uniswap/Swapr V3: fees from Collect events. Balancer V2/V3: pool swap fees attributed by the wallet contribution share, net of the protocol fee.',
  chartType: 'numberDisplay',
  variant: 'default',
  format: 'formatCurrency',
  valueField: 'value',
  globalFilterField: 'wallet_address',
  query: `
    SELECT wallet_address, total_lp_fees_usd AS value
    FROM dbt.api_execution_yields_user_kpis
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
