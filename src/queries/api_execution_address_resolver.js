// Backs the Account Portfolio tab's first round-trip: given an address,
// returns one row with boolean flags + counts for each domain (safe, safe
// owner, circles avatar, gpay wallet, validator withdrawal_address). The
// custom view uses the row to decide which sub-tabs to render.
//
// All the logic lives in dbt (`fct_execution_address_resolver`); this
// metric is a pure passthrough.
const metric = {
  id: 'api_execution_address_resolver',
  name: 'Account Portfolio Resolver',
  chartType: 'table',
  hidden: true,
  query: `
    SELECT *
    FROM dbt.api_execution_address_resolver
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
