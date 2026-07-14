const formatNumberCell = (cell) => {
  const v = cell.getValue();
  if (v == null) return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatScope = (cell) => {
  const v = String(cell.getValue() || '');
  if (v === 'earned') return 'Earned rewards';
  if (v === 'full_invite_graph') return 'Full invite graph';
  return v;
};

const metric = {
  id: 'api_execution_gnosis_app_gt_referrals',
  name: 'Referral Graph (GT)',
  description: 'Earned rewards vs full invite graph',
  metricDescription: `Ground-truth referral graph, two scopes side by side. **\`Earned rewards\`** = the Gnosis App-native paid-reward ledger (\`stg_envio_ga__earned_from_invite\`): \`Inviters\` and \`Invitees\` are distinct addresses that actually earned/received a reward and \`Edges\` is the reward-record count. **\`Full invite graph\`** = every accepted invite (avatar \`invited_by\` set), a roughly 2.2x superset of the earned ledger. Reward USD is unavailable (CRC has no price feed), and the earned ledger must never be reconciled against the Circles v2 \`inviter_fee\`.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    rowHeight: 56,
    movableColumns: false,
    columns: [
      { title: 'Scope',    field: 'metric_scope', minWidth: 200, widthGrow: 2, sorter: 'string', formatter: formatScope },
      { title: 'Inviters', field: 'n_inviters',   width: 150, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell },
      { title: 'Invitees', field: 'n_invitees',   width: 150, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell },
      { title: 'Edges',    field: 'n_edges',      width: 150, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell },
    ],
    initialSort: [{ column: 'n_invitees', dir: 'desc' }],
  },
  query: `
    SELECT metric_scope, n_inviters, n_invitees, n_edges
    FROM dbt.api_execution_gnosis_app_gt_referrals
    ORDER BY n_invitees DESC
  `,
};
export default metric;
