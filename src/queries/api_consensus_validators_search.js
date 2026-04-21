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
  // rows so the dropdown loads in one fast request. display_name includes validator
  // count + a first-validator-index hint so operator vs solo credentials are legible.
  query: `
    SELECT
      withdrawal_credentials,
      withdrawal_address,
      validator_count,
      first_validator_index,
      display_name
    FROM dbt.api_consensus_validators_search
  `,
};

export default metric;
