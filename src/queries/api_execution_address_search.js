// Dropdown source for the Account Portfolio tab's global filter.
// Shape matches the other search metrics (circles_v2_avatar_search,
// consensus_validators_search): two columns, (address, display_name),
// loaded in one request; LabelSelector substring-matches client-side.
const metric = {
  id: 'api_execution_address_search',
  name: 'Account Address Search Index',
  description: 'Internal lookup for the Account Portfolio tab global filter.',
  chartType: 'table',
  hidden: true,
  query: `SELECT address, display_name FROM dbt.api_execution_address_search`,
};

export default metric;
