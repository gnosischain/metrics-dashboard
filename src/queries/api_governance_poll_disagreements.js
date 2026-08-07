const metric = {
  id: 'api_governance_poll_disagreements',
  name: 'Forum vs Snapshot disagreements',
  description: 'Pre-vote temperature checks that flipped against the token ballot',
  metricDescription: `Honest pre-vote forum temperature checks (\`is_pre_vote_check\`) where the
forum headcount verdict and the Snapshot voting-power verdict landed on opposite sides of
50% against.

These are different populations: Discourse is one-person-one-vote; Snapshot is
token-weighted. Poll sample sizes are small (roughly 10–65) — directional, not precise.
Grain is (poll, proposal); a re-balloted GIP can appear more than once.

Source: \`dbt.api_governance_poll_vs_vote\`.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'abs_gap', dir: 'desc' }],
    columns: [
      {
        title: 'GIP',
        field: 'gip_number',
        minWidth: 60,
        widthGrow: 0.5,
        sorter: 'number',
        hozAlign: 'right',
      },
      {
        title: 'Title',
        field: 'title',
        minWidth: 220,
        widthGrow: 4,
        sorter: 'string',
        formatter: 'plaintext',
      },
      {
        title: 'Poll',
        field: 'poll_name',
        minWidth: 120,
        widthGrow: 2,
        sorter: 'string',
      },
      {
        title: 'Forum against %',
        field: 'poll_against_pct',
        minWidth: 110,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toFixed(1) + '%';
        },
      },
      {
        title: 'Snapshot against %',
        field: 'vote_against_pct',
        minWidth: 120,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toFixed(1) + '%';
        },
      },
      {
        title: 'Gap (pp)',
        field: 'gap_pp',
        minWidth: 80,
        widthGrow: 0.8,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          const n = Number(val);
          return (n > 0 ? '+' : '') + n.toFixed(1);
        },
      },
    ],
  },
  query: `
    SELECT
      gip_number,
      title,
      poll_name,
      round(poll_against_share * 100, 1) AS poll_against_pct,
      round(vote_against_share_by_vp * 100, 1) AS vote_against_pct,
      round(poll_minus_vote_vp * 100, 1) AS gap_pp,
      abs(poll_minus_vote_vp) AS abs_gap
    FROM dbt.api_governance_poll_vs_vote
    WHERE is_pre_vote_check = 1
      AND verdicts_disagree = 1
      AND poll_minus_vote_vp IS NOT NULL
    ORDER BY abs_gap DESC
    LIMIT 20
  `,
};

export default metric;
