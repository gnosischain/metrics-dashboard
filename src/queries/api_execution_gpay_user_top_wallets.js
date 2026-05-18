const metric = {
  id: 'api_execution_gpay_user_top_wallets',
  name: 'Top GPay Wallets',
  description: 'Top wallets by payment activity for the User Portfolio dropdown.',
  chartType: 'table',
  hidden: true,

  query: `
    SELECT wallet_address
    FROM dbt.api_execution_gpay_user_top_wallets
  `,
};

export default metric;
