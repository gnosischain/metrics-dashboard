const metric = {
  id: 'api_governance_delegates_latest',
  name: 'Top Delegates',
  description: 'By number of delegators',
  metricDescription: 'Current Snapshot delegates ranked by number of delegators. Delegate addresses are wallets, already public on-chain.',
  chartType: 'table',
  minimal: true,
  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    responsiveLayout: 'collapse',
    height: 400,
    selectableRows: false,
    paginationSizeSelector: [10, 25],
    columns: [
      { title: 'Delegate', field: 'delegate', minWidth: 320, sorter: 'string', formatter: 'plaintext' },
      { title: 'Delegators', field: 'delegator_count', width: 130, sorter: 'number', hozAlign: 'right' },
      { title: 'First Delegation', field: 'first_delegation', width: 150, sorter: 'string', hozAlign: 'right' },
      { title: 'Last Delegation', field: 'last_delegation', width: 150, sorter: 'string', hozAlign: 'right' },
    ],
  },
  query: `
    SELECT
      delegate,
      delegator_count,
      toString(toDate(first_delegation_at)) AS first_delegation,
      toString(toDate(last_delegation_at)) AS last_delegation
    FROM dbt.api_governance_delegates_latest
    ORDER BY delegator_count DESC
    LIMIT 25
  `,
};
export default metric;
