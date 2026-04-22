// Lightweight lookup used by the global filter on the Consensus dashboard's
// Validator Explorer tab. Lets users search by validator_index, pubkey,
// withdrawal_credentials, or withdrawal_address — each option's value is the
// withdrawal_credentials, so all charts on the tab filter on a single field.
const metric = {
  id: 'api_consensus_validators_search',
  name: 'Validator Search Index',
  description: 'Internal lookup for the Validator Explorer tab global filter.',
  chartType: 'table',
  hidden: true,

  // One row per withdrawal_credentials (~3.4k rows) — collapsed from ~558k per-validator
  // rows so the dropdown loads in one fast request. Returns exactly two columns to match
  // the minimal shape of other working search sources (circles avatar_search,
  // gpay_user_top_wallets) — adding extra numeric columns (validator_count,
  // first_validator_index) broke the LabelSelector's "extract unique labels" step and
  // produced an empty dropdown that spins forever.
  query: `
    SELECT
      withdrawal_credentials,
      display_name
    FROM dbt.api_consensus_validators_search
  `,
};

export default metric;
