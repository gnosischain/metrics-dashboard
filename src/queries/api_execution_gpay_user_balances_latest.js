
const metric = {
  id: 'api_execution_gpay_user_balances_latest',
  name: 'Current Balance',
  description: 'Latest USD balance by token',
  metricDescription: `
  Current balance breakdown by token for the selected wallet, shown in USD. 
  Includes EURe, GBPe, USDC.e, and GNO.
  `,
  chartType: 'pie',
  nameField: 'token',
  valueField: 'value_usd',
  format: 'formatCurrency',
  globalFilterField: 'wallet_address',
  showTotal: true,
   
  query: `
    SELECT wallet_address, token, value_usd, value_native, date
    FROM dbt.api_execution_gpay_user_balances_latest
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};
export default metric;
