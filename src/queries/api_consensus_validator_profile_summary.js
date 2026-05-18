const metric = {
  id: 'api_consensus_validator_profile_summary',
  name: 'Validator Explorer Validator Summary',
  chartType: 'table',
  hidden: true,
  query: `
    WITH filtered_members AS (
      SELECT *
      FROM dbt.api_consensus_validators_explorer_members_table
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    ),
    credential_scope AS (
      SELECT any(withdrawal_credentials) AS withdrawal_credentials
      FROM filtered_members
    ),
    credential_groups AS (
      SELECT
        members.withdrawal_credentials AS withdrawal_credentials,
        count() AS connected_validator_count
      FROM dbt.api_consensus_validators_explorer_members_table AS members
      INNER JOIN credential_scope AS scope
        ON scope.withdrawal_credentials = members.withdrawal_credentials
      GROUP BY members.withdrawal_credentials
    ),
    filtered_income AS (
      SELECT *
      FROM dbt.int_consensus_validators_income_daily
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    )
    -- Explicit AS <name> aliases on every column below. Without them, ClickHouse
    -- qualifies any column that collides with the \`latest\` LEFT JOIN (balance_gno,
    -- effective_balance_gno, total_income_estimated_gno, withdrawal_credentials,
    -- proposed_blocks_count_lifetime, proposer_reward_total_lifetime_gno) as
    -- \`members.<col>\`. metrics.js wraps this SELECT with \`SELECT * FROM (...)\`
    -- which preserves the qualified name into the JSON response. The React code
    -- then reads \`summary.balance_gno\` and gets undefined -> renders "0 GNO".
    SELECT
      members.validator_index AS validator_index,
      members.pubkey AS pubkey,
      members.withdrawal_address AS withdrawal_address,
      members.withdrawal_credentials AS withdrawal_credentials,
      '' AS display_name,
      coalesce(groups.connected_validator_count, latest.validator_count, 1) AS connected_validator_count,
      members.status AS status,
      members.slashed AS slashed,
      members.balance_gno AS balance_gno,
      members.effective_balance_gno AS effective_balance_gno,
      members.total_income_estimated_gno AS total_income_estimated_gno,
      members.proposed_blocks_count_lifetime AS proposed_blocks_count_lifetime,
      members.proposer_reward_total_lifetime_gno AS proposer_reward_total_lifetime_gno,
      members.activation_date AS activation_date,
      members.exit_date AS exit_date,
      members.withdrawable_date AS withdrawable_date,
      members.activation_epoch AS activation_epoch,
      members.exit_epoch AS exit_epoch,
      members.withdrawable_epoch AS withdrawable_epoch,
      if(toDate(members.latest_date) < toDate('2020-01-01'), NULL, members.latest_date) AS latest_date,
      if(toDate(rollup.history_start_date) < toDate('2020-01-01'), NULL, rollup.history_start_date) AS history_start_date,
      if(toDate(rollup.latest_history_date) < toDate('2020-01-01'), NULL, rollup.latest_history_date) AS latest_history_date,
      rollup.income_today_gno AS income_today_gno,
      rollup.income_1d_gno AS income_1d_gno,
      rollup.income_7d_gno AS income_7d_gno,
      rollup.income_30d_gno AS income_30d_gno,
      rollup.apy_7d AS apy_7d,
      rollup.apy_30d_window AS apy_30d_window,
      rollup.apy_365d AS apy_365d
    FROM filtered_members AS members
    LEFT JOIN credential_groups AS groups
      ON groups.withdrawal_credentials = members.withdrawal_credentials
    LEFT JOIN dbt.api_consensus_validators_explorer_latest AS latest
      ON latest.withdrawal_credentials = members.withdrawal_credentials
    LEFT JOIN (
      SELECT
        base.validator_index,
        min(base.date) AS history_start_date,
        max(base.date) AS latest_history_date,
        sumIf(base.consensus_income_amount_gno, base.date = latest.latest_history_date) AS income_today_gno,
        sumIf(base.consensus_income_amount_gno, base.date = latest.latest_history_date) AS income_1d_gno,
        sumIf(base.consensus_income_amount_gno, base.date >= addDays(latest.latest_history_date, -6)) AS income_7d_gno,
        sumIf(base.consensus_income_amount_gno, base.date >= addDays(latest.latest_history_date, -29)) AS income_30d_gno,
        avgIf(base.apy, base.date >= addDays(latest.latest_history_date, -6)) AS apy_7d,
        avgIf(base.apy, base.date >= addDays(latest.latest_history_date, -29)) AS apy_30d_window,
        avgIf(base.apy, base.date >= addDays(latest.latest_history_date, -364)) AS apy_365d
      FROM filtered_income AS base
      INNER JOIN (
        SELECT
          validator_index,
          max(date) AS latest_history_date
        FROM filtered_income
        GROUP BY validator_index
      ) AS latest
        ON latest.validator_index = base.validator_index
      GROUP BY base.validator_index, latest.latest_history_date
    ) AS rollup
      ON rollup.validator_index = members.validator_index
  `
};

export default metric;
