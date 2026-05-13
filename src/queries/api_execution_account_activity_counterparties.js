const metric = {
  id: 'api_execution_account_activity_counterparties',
  name: 'Account Activity — Counterparties',
  description: 'Top counterparties for an address within a window, with transfer counts and project/sector labels.',
  globalFilterField: 'wallet_address',
  query: `
    WITH edges AS (
      SELECT * FROM (
        SELECT date, symbol, "to" AS wallet_address, "from" AS counterparty, transfer_count
        FROM dbt.int_execution_transfers_whitelisted_daily
        WHERE date BETWEEN toDate('{from}') AND toDate('{to}')
      )
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      UNION ALL
      SELECT * FROM (
        SELECT date, symbol, "from" AS wallet_address, "to" AS counterparty, transfer_count
        FROM dbt.int_execution_transfers_whitelisted_daily
        WHERE date BETWEEN toDate('{from}') AND toDate('{to}')
      )
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    ),
    agg AS (
      SELECT
        counterparty,
        sum(transfer_count) AS transfers,
        count(DISTINCT date) AS active_days,
        count(DISTINCT symbol) AS distinct_tokens,
        max(date) AS last_seen
      FROM edges
      WHERE counterparty IS NOT NULL
      GROUP BY counterparty
    ),
    labels AS (
      SELECT address, project, sector
      FROM dbt.int_crawlers_data_labels
      WHERE address IN (SELECT counterparty FROM agg)
    )
    SELECT
      agg.counterparty AS counterparty,
      lbl.project AS project,
      lbl.sector AS sector,
      agg.transfers AS transfers,
      agg.active_days AS active_days,
      agg.distinct_tokens AS distinct_tokens,
      agg.last_seen AS last_seen
    FROM agg
    LEFT JOIN labels AS lbl ON lbl.address = agg.counterparty
    ORDER BY agg.transfers DESC
    LIMIT 50
  `,
};

export default metric;
