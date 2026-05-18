const metric = {
  id: 'api_execution_safes_current_owners',
  name: 'Safe Current Owners',
  description: 'Current owners for a selected Safe',
  chartType: 'table',
  globalFilterField: 'safe_address',
  valueField: 'current_threshold',
  labelField: 'owner_address',
  query: `
    SELECT
      safe_address,
      owner_address,
      became_owner_at,
      current_threshold
    FROM dbt.api_execution_safes_current_owners
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
