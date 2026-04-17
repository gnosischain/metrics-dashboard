const metric = {
  id: 'api_execution_yields_user_top_wallets',
  name: 'Top Yields Wallets',
  description: 'Top wallets by LP and lending activity for the User Portfolio dropdown.',
  chartType: 'table',
  hidden: true,

  query: `
    SELECT wallet_address
    FROM playground_max.api_execution_yields_user_top_wallets
  `,
};

export default metric;
