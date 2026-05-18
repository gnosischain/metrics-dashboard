const metric = {
  id: 'api_consensus_validator_group_summary',
  name: 'Validator Explorer Group Summary',
  chartType: 'table',
  hidden: true,
  query: `
    WITH credential_groups AS (
      SELECT
        withdrawal_credentials,
        min(validator_index) AS first_validator_index,
        count() AS connected_validator_count,
        anyLast(withdrawal_address) AS withdrawal_address
      FROM dbt.api_consensus_validators_explorer_members_table
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      GROUP BY withdrawal_credentials
    ),
    filtered_latest AS (
      SELECT *
      FROM dbt.api_consensus_validators_explorer_latest
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
    ),
    history AS (
      SELECT
        withdrawal_credentials,
        min(date) AS history_start_date,
        max(date) AS latest_history_date
      FROM dbt.api_consensus_validators_explorer_daily
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      GROUP BY withdrawal_credentials
    ),
    lifecycle AS (
      -- Lifecycle envelope for the credential: earliest activation across any
      -- validator under the credential, latest activation (still onboarding?),
      -- and latest exit (operator wound down?). Hero renders all three so the
      -- user can read the active window end-to-end at a glance.
      SELECT
        withdrawal_credentials,
        minOrNull(activation_date) AS first_activation_date,
        maxOrNull(activation_date) AS last_activation_date,
        maxOrNull(exit_date)       AS last_exit_date
      FROM dbt.api_consensus_validators_explorer_members_table
      WHERE 1 = 1
        /*__FILTER_CONDITIONS__*/
      GROUP BY withdrawal_credentials
    )
    -- Explicit AS <name> aliases below. ClickHouse would otherwise emit column
    -- names like \`latest.balance_gno\` (qualified because the LEFT JOIN targets
    -- share the withdrawal_credentials key), which the frontend code can't read.
    SELECT
      latest.withdrawal_credentials AS withdrawal_credentials,
      '' AS display_name,
      coalesce(groups.withdrawal_address, '') AS withdrawal_address,
      coalesce(groups.first_validator_index, 0) AS first_validator_index,
      coalesce(groups.connected_validator_count, latest.validator_count) AS connected_validator_count,
      latest.validator_count AS validator_count,
      latest.active_count AS active_count,
      latest.exited_count AS exited_count,
      latest.pending_count AS pending_count,
      latest.slashed_count AS slashed_count,
      latest.balance_gno AS balance_gno,
      latest.effective_balance_gno AS effective_balance_gno,
      latest.cumulative_deposits_gno AS cumulative_deposits_gno,
      latest.cumulative_withdrawals_gno AS cumulative_withdrawals_gno,
      latest.total_income_estimated_gno AS total_income_estimated_gno,
      latest.consensus_income_amount_30d_gno AS consensus_income_amount_30d_gno,
      latest.proposer_reward_total_30d_gno AS proposer_reward_total_30d_gno,
      latest.proposed_blocks_count_lifetime AS proposed_blocks_count_lifetime,
      latest.proposer_reward_total_lifetime_gno AS proposer_reward_total_lifetime_gno,
      latest.apy_30d AS apy_30d,
      history.history_start_date AS history_start_date,
      history.latest_history_date AS latest_history_date,
      lifecycle.first_activation_date AS first_activation_date,
      lifecycle.last_activation_date AS last_activation_date,
      lifecycle.last_exit_date AS last_exit_date
    FROM filtered_latest AS latest
    LEFT JOIN credential_groups AS groups
      ON groups.withdrawal_credentials = latest.withdrawal_credentials
    LEFT JOIN history
      ON history.withdrawal_credentials = latest.withdrawal_credentials
    LEFT JOIN lifecycle
      ON lifecycle.withdrawal_credentials = latest.withdrawal_credentials
  `
};

export default metric;
