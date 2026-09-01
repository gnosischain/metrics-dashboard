const metric = {
  id: 'api_governance_contributors_latest',
  name: 'Top Forum Contributors',
  description: 'Pseudonymous, top 200 by posts',
  metricDescription: 'Top 200 forum contributors by post count. Contributor keys are stable pseudonyms — no usernames, user ids, or real names exist anywhere in the governance marts (verified identity sweep).',
  chartType: 'table',
  minimal: true,
  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    responsiveLayout: 'collapse',
    height: 400,
    selectableRows: false,
    paginationSizeSelector: [10, 20, 50],
    columns: [
      { title: 'Contributor (pseudonymous)', field: 'contributor', minWidth: 200, sorter: 'string', formatter: 'plaintext' },
      { title: 'Posts', field: 'posts', width: 90, sorter: 'number', hozAlign: 'right' },
      { title: 'Topics Started', field: 'topics_started', width: 130, sorter: 'number', hozAlign: 'right' },
      { title: 'Likes Received', field: 'likes_received', width: 130, sorter: 'number', hozAlign: 'right' },
      { title: 'Likes Given', field: 'likes_given', width: 120, sorter: 'number', hozAlign: 'right' },
      { title: 'Trust Level', field: 'trust_level', width: 110, sorter: 'number', hozAlign: 'right' },
    ],
  },
  query: `
    SELECT
      toString(contributor_key) AS contributor,
      posts,
      topics_started,
      likes_received,
      likes_given,
      trust_level
    FROM dbt.api_governance_contributors_latest
    ORDER BY posts DESC
    LIMIT 200
  `,
};
export default metric;
