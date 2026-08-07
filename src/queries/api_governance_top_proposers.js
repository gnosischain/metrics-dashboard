const metric = {
  id: 'api_governance_top_proposers',
  name: 'Top proposers',
  description: 'Most prolific authors with enactment rate (top 15)',
  metricDescription: `Top 15 proposal authors by count. Enactment rate is
(passed + decided) / closed proposals for that author — distinct from the headline GIP
pass rate, which is pass/fail only and excludes selection ballots.

Source: \`dbt.api_governance_top_proposers\`.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    height: '100%',
    movableColumns: false,
    initialSort: [{ column: 'proposals_authored', dir: 'desc' }],
    columns: [
      {
        title: 'Author',
        field: 'author',
        minWidth: 160,
        widthGrow: 3,
        sorter: 'string',
        formatter: 'plaintext',
      },
      {
        title: 'Proposals',
        field: 'proposals_authored',
        minWidth: 90,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
      },
      {
        title: 'GIPs',
        field: 'gips_authored',
        minWidth: 70,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
      },
      {
        title: 'Enacted',
        field: 'enacted',
        minWidth: 80,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
      },
      {
        title: 'Enactment %',
        field: 'enactment_rate_pct',
        minWidth: 100,
        widthGrow: 1,
        sorter: 'number',
        hozAlign: 'right',
        formatter: function (cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return '-';
          return Number(val).toFixed(0) + '%';
        },
      },
    ],
  },
  query: `
    SELECT
      author,
      proposals_authored,
      gips_authored,
      enacted,
      if(enactment_rate IS NULL, NULL, round(enactment_rate * 100, 0)) AS enactment_rate_pct
    FROM dbt.api_governance_top_proposers
    ORDER BY proposals_authored DESC, gips_authored DESC
    LIMIT 15
  `,
};

export default metric;
