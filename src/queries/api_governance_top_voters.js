const metric = {
  id: 'api_governance_top_voters',
  name: 'Top voters',
  description: 'Most active voters by proposals voted (top 15)',
  metricDescription: `Top 15 voters by number of proposals voted on. \`total_vp_cast\` is
participation-weighted voting power across those ballots — not a wallet balance.

Source: \`dbt.api_governance_top_voters\`.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'proposals_voted', dir: 'desc' }],
    columns: [
      {
        title: 'Voter',
        field: 'voter',
        minWidth: 160,
        widthGrow: 3,
        sorter: 'string',
        formatter: 'plaintext',
      },
      {
        title: 'Proposals',
        field: 'proposals_voted',
        minWidth: 90,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
      },
      {
        title: 'Total VP cast',
        field: 'total_vp_cast',
        minWidth: 120,
        widthGrow: 2,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
        },
      },
      {
        title: 'Avg VP',
        field: 'avg_vp',
        minWidth: 100,
        widthGrow: 1.5,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 });
        },
      },
    ],
  },
  query: `
    SELECT
      voter,
      proposals_voted,
      total_vp_cast,
      avg_vp
    FROM dbt.api_governance_top_voters
    ORDER BY proposals_voted DESC, total_vp_cast DESC
    LIMIT 15
  `,
};

export default metric;
