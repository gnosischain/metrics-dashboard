// Validation metric for the Validator Explorer tab. The dashboard fetches this with
// the selected withdrawal_credentials before rendering any chart on the tab; if 0 rows
// come back, the tab stays on its empty-state card. Not surfaced as a chart itself.
const metric = {
  id: 'api_consensus_validators_explorer_latest',
  name: 'Validator Explorer — operator summary',
  description: 'Per-operator (withdrawal_credentials) latest snapshot aggregate.',
  chartType: 'table',
  hidden: true,

  query: `SELECT * FROM dbt.api_consensus_validators_explorer_latest`,
};

export default metric;
