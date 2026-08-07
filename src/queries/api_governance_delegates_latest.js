const metric = {
  id: 'api_governance_delegates_latest',
  name: 'Current delegates',
  description: 'On-chain DelegateRegistry: who receives the most delegations',
  metricDescription: `Current delegates for \`gnosis.eth\` by count of active on-chain
delegators (Ethereum mainnet DelegateRegistry). This is a separate relationship from the
per-vote "Delegated" power-source split in Snapshot strategies.

\`first_delegation_at\` / \`last_delegation_at\` are the earliest and latest active
delegation edges still pointing at that delegate.

Source: \`dbt.api_governance_delegates_latest\`.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 20,
    paginationSizeSelector: false,
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'delegator_count', dir: 'desc' }],
    columns: [
      {
        title: 'Delegate',
        field: 'delegate',
        minWidth: 200,
        widthGrow: 3,
        sorter: 'string',
        formatter: 'plaintext',
      },
      {
        title: 'Delegators',
        field: 'delegator_count',
        minWidth: 100,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
      },
      {
        title: 'First active',
        field: 'first_delegation_at',
        minWidth: 140,
        widthGrow: 1.5,
        sorter: 'string',
      },
      {
        title: 'Last change',
        field: 'last_delegation_at',
        minWidth: 140,
        widthGrow: 1.5,
        sorter: 'string',
      },
    ],
  },
  query: `
    SELECT
      delegate,
      delegator_count,
      formatDateTime(first_delegation_at, '%Y-%m-%d') AS first_delegation_at,
      formatDateTime(last_delegation_at, '%Y-%m-%d') AS last_delegation_at
    FROM dbt.api_governance_delegates_latest
    ORDER BY delegator_count DESC, last_delegation_at DESC
  `,
};

export default metric;
