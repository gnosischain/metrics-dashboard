const metric = {
  id: 'api_governance_direction_divergence',
  name: 'Headcount vs voting power',
  description: 'GIPs where small holders and capital disagreed most',
  metricDescription: `Largest absolute gaps between against-share by headcount and against-share
by voting power on directional GIP ballots with at least 30 voters.

- **Positive gap** — small holders were more opposed than capital
- **Negative gap** — capital was more opposed than the crowd

Shares exclude abstain. Ranked-choice ballots are excluded (\`directional = 0\`).

Source: \`dbt.api_governance_proposal_direction\`.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'abs_gap_pct', dir: 'desc' }],
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
        title: 'Outcome',
        field: 'outcome',
        minWidth: 90,
        widthGrow: 1,
        sorter: 'string',
      },
      {
        title: 'Voters',
        field: 'voters',
        minWidth: 70,
        widthGrow: 0.7,
        sorter: 'number',
        hozAlign: 'right',
      },
      {
        title: 'Against % head',
        field: 'against_head_pct',
        minWidth: 100,
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
        title: 'Against % VP',
        field: 'against_vp_pct',
        minWidth: 100,
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
      outcome,
      voters,
      round(against_share_by_head * 100, 1) AS against_head_pct,
      round(against_share_by_vp * 100, 1) AS against_vp_pct,
      round(head_minus_weight_against * 100, 1) AS gap_pp,
      abs(head_minus_weight_against) AS abs_gap_pct
    FROM dbt.api_governance_proposal_direction
    WHERE is_gip = 1
      AND directional = 1
      AND voters >= 30
      AND head_minus_weight_against IS NOT NULL
    ORDER BY abs_gap_pct DESC
    LIMIT 20
  `,
};

export default metric;
