const metric = {
  id: 'api_execution_account_activity_totals',
  name: 'Account Activity — Window Totals',
  description: 'Total transfers, active days, and counterparty count for an address within a window. Powers the hero KPI cards so they match the heatmap meta line.',
  globalFilterField: 'wallet_address',
  query: `
    WITH edges AS (
      SELECT * FROM (
        SELECT date, transfer_count, "to" AS wallet_address, "from" AS counterparty
        FROM dbt.int_execution_transfers_whitelisted_daily
        WHERE date BETWEEN toDate('{from}') AND toDate('{to}')
      ) WHERE 1 = 1 /*__FILTER_CONDITIONS__*/
      UNION ALL
      SELECT * FROM (
        SELECT date, transfer_count, "from" AS wallet_address, "to" AS counterparty
        FROM dbt.int_execution_transfers_whitelisted_daily
        WHERE date BETWEEN toDate('{from}') AND toDate('{to}')
      ) WHERE 1 = 1 /*__FILTER_CONDITIONS__*/
    )
    SELECT
      sum(transfer_count) AS total_transfers,
      count(DISTINCT date) AS active_days,
      count(DISTINCT counterparty) AS counterparty_count
    FROM edges
    WHERE counterparty IS NOT NULL
  `,
};

export default metric;
