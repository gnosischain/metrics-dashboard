const metric = {
  id: 'api_execution_account_activity_heatmap',
  name: 'Account Activity — Daily Transfer Heatmap',
  description: 'Daily transfer counts (inbound + outbound) for an address, for the calendar heatmap.',
  globalFilterField: 'wallet_address',
  query: `
    WITH edges AS (
      SELECT * FROM (
        SELECT date, transfer_count, "to" AS wallet_address
        FROM dbt.int_execution_transfers_whitelisted_daily
        WHERE date BETWEEN toDate('{from}') AND toDate('{to}')
      )
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      UNION ALL
      SELECT * FROM (
        SELECT date, transfer_count, "from" AS wallet_address
        FROM dbt.int_execution_transfers_whitelisted_daily
        WHERE date BETWEEN toDate('{from}') AND toDate('{to}')
      )
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    )
    SELECT date, sum(transfer_count) AS transfers
    FROM edges
    GROUP BY date
    ORDER BY date
  `,
};

export default metric;
