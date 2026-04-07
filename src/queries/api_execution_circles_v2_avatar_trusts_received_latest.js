const metric = {
  id: 'api_execution_circles_v2_avatar_trusts_received_latest',
  name: 'Trusts Received',
  description: 'Incoming trust relationships',
  chartType: 'numberDisplay',
  globalFilterField: 'avatar',
  valueField: 'trusts_received_count',
  format: 'formatNumber',

  query: `
    SELECT avatar, trusts_given_count, trusts_received_count
    FROM dbt.api_execution_circles_v2_avatar_trusts_summary
  `,
};

export default metric;
