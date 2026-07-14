const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatInviterAddress = (cell) => {
  const address = String(cell.getValue() || '').trim();
  if (!address) return '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="table-link" `
    + `style="font-family:monospace;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">`
    + `${escapeHtml(address)}</a>`;
};

const metric = {
  id: 'api_execution_circles_v2_inviter_farm_quota',
  name: 'Invitation Farm Leaderboard',
  description: 'Inviters ranked by invites claimed from the farm',
  metricDescription: `Leaderboard of the Circles v2 **InvitationFarm** — the contract that grants inviters a quota of free invites to onboard new humans. \`Invites claimed\` is the total number of invites this inviter has drawn from the farm (\`invites_claimed\`, summed over all \`Claim\` events); \`Claim events\` is how many separate claim transactions that took. \`Current quota\` is the inviter's latest granted allowance (NULL / "—" if a quota was never explicitly set). \`First\` / \`Last claim\` bound the inviter's activity window. This is distinct from the general **Top Inviters** leaderboard (which ranks by humans actually registered): the farm quota measures *capacity granted and drawn*, not invites that converted to registrations. Ordered by invites claimed; top 200 inviters. Snapshot as of the latest InvitationFarm event.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 25,
    rowHeight: 44,
    movableColumns: false,
    columns: [
      { title: 'Inviter',         field: 'inviter',         minWidth: 300, widthGrow: 3, sorter: 'string', formatter: formatInviterAddress },
      { title: 'Invites claimed', field: 'invites_claimed', width: 150, sorter: 'number', hozAlign: 'right' },
      { title: 'Claim events',    field: 'n_claim_events',  width: 130, sorter: 'number', hozAlign: 'right' },
      { title: 'Current quota',   field: 'current_quota',   width: 140, sorter: 'number', hozAlign: 'right' },
      { title: 'First claim',     field: 'first_claim',     width: 130, sorter: 'string' },
      { title: 'Last claim',      field: 'last_claim',      width: 130, sorter: 'string' },
    ],
  },
  query: `
    SELECT
      inviter,
      invites_claimed,
      n_claim_events,
      current_quota,
      toDate(first_claim_at) AS first_claim,
      toDate(last_claim_at)  AS last_claim
    FROM dbt.api_execution_circles_v2_inviter_farm_quota
    ORDER BY invites_claimed DESC
    LIMIT 200
  `,
};
export default metric;
