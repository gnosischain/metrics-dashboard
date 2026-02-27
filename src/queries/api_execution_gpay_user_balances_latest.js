import { format } from "echarts";

const metric = {
  id: 'api_execution_gpay_user_balances_latest',
  name: 'Current Balance',
  description: 'Latest USD balance by token',
  chartType: 'pie',
  nameField: 'token',
  valueField: 'value_usd',
  format: 'formatCurrency',
  globalFilterField: 'wallet_address',
  showTotal: true,
   
  query: `
    SELECT wallet_address, token, sum(value_usd) as value_usd
    FROM dbt.api_execution_gpay_user_balances_daily
    WHERE date = (SELECT MAX(date) FROM dbt.api_execution_gpay_user_balances_daily)
    GROUP BY wallet_address, token  
  `,
};
export default metric;
