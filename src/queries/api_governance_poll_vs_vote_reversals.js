const metric = {
  id: 'api_governance_poll_vs_vote_reversals',
  name: 'Poll vs Vote Reversals',
  description: 'Forum verdict ≠ Snapshot verdict',
  metricDescription: 'GIPs where the forum temperature-check verdict and the Snapshot ballot verdict disagree. Floors applied for honesty: verdicts must actually disagree, at least 10 decisive poll votes, and the poll must be a genuine pre-vote temperature check. The outcome column matters: "rejected" means capital opposed; "below_quorum" means capital was absent — different failures. A re-balloted GIP appears once per ballot (poll × proposal grain).',
  chartType: 'table',
  minimal: true,
  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    responsiveLayout: 'collapse',
    height: 400,
    selectableRows: false,
    columns: [
      { title: 'GIP', field: 'gip', width: 80, sorter: 'number', hozAlign: 'right' },
      { title: 'Title', field: 'title', minWidth: 240, sorter: 'string', formatter: 'plaintext' },
      { title: 'Outcome', field: 'outcome', width: 130, sorter: 'string' },
      { title: 'Poll Against %', field: 'poll_against_pct', width: 130, sorter: 'number', hozAlign: 'right' },
      { title: 'Vote Against % (VP)', field: 'vote_against_pct', width: 150, sorter: 'number', hozAlign: 'right' },
      { title: 'Poll Voters', field: 'poll_voters', width: 110, sorter: 'number', hozAlign: 'right' },
      { title: 'Ballot Voters', field: 'vote_voters', width: 110, sorter: 'number', hozAlign: 'right' },
    ],
  },
  query: `
    SELECT
      gip_number AS gip,
      title,
      outcome,
      round(toFloat64(poll_against_share) * 100, 1) AS poll_against_pct,
      round(toFloat64(vote_against_share_by_vp) * 100, 1) AS vote_against_pct,
      poll_voters,
      vote_voters
    FROM dbt.api_governance_poll_vs_vote
    WHERE verdicts_disagree = 1 AND decisive_votes >= 10 AND is_pre_vote_check = 1
    ORDER BY proposal_created_at DESC
  `,
};
export default metric;
