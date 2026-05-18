const metric = {
  id: 'api_execution_account_role_flags_current',
  name: 'Account Role Flags',
  description: 'Current role flags for an address (Safe, GPay, Circles avatar, LP, lender, validator depositor, Dune labels).',
  globalFilterField: 'address',
  query: `
    SELECT
      address,
      is_safe,
      is_safe_owner,
      is_gpay_wallet,
      is_ga_user,
      controls_gpay_wallet,
      is_circles_avatar,
      circles_avatar_type,
      is_circles_wrapper,
      is_lp_provider,
      pool_protocol,
      is_pool,
      is_lending_user,
      is_validator_depositor,
      has_dune_label,
      dune_project
    FROM dbt.int_execution_address_roles_current
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
