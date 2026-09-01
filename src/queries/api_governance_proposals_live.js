const metric = {
  id: 'api_governance_proposals_live',
  name: 'Open Ballots Now',
  description: 'Empty = no vote is open',
  metricDescription: 'Snapshot proposals currently open for voting. An empty table is the normal state — it means no vote is open right now, not that data is missing. Quorum status vocabulary: met / missed / unspecified (older proposals had no quorum field — legitimate, not a miss).',
  chartType: 'table',
  minimal: true,
  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    responsiveLayout: 'collapse',
    height: 400,
    selectableRows: false,
    tabulatorConfig: {
      placeholder: 'No open votes right now',
    },
    columns: [
      { title: 'GIP', field: 'gip', width: 80, sorter: 'number', hozAlign: 'right' },
      { title: 'Title', field: 'title', minWidth: 280, sorter: 'string', formatter: 'plaintext' },
      { title: 'Ends', field: 'end_at', width: 160, sorter: 'string', hozAlign: 'right' },
      { title: 'Hours Left', field: 'hours_left', width: 110, sorter: 'number', hozAlign: 'right' },
      { title: 'Votes', field: 'votes_count', width: 90, sorter: 'number', hozAlign: 'right' },
      { title: 'Quorum', field: 'quorum_status', width: 110, sorter: 'string' },
    ],
  },
  query: `
    SELECT
      gip_number AS gip,
      title,
      toString(end_at) AS end_at,
      hours_left,
      votes_count,
      quorum_status
    FROM dbt.api_governance_proposals_live
    ORDER BY end_at
  `,
};
export default metric;
