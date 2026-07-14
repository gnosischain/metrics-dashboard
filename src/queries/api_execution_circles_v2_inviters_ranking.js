const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const colorFromKey = (key) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const palette = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];
  return palette[hash % palette.length];
};

const renderAvatarThumb = (imageUrl, displayName, key) => {
  const url = String(imageUrl || '').trim();
  const initial = (String(displayName || '').trim().slice(0, 1) || '?').toUpperCase();
  const bg = colorFromKey(String(key || displayName || initial));
  const safeInitial = escapeHtml(initial);
  const placeholderInner =
    `<span style="position:absolute;inset:0;display:flex;align-items:center;`
    + `justify-content:center;border-radius:50%;background:${bg};color:#fff;`
    + `font-size:14px;font-weight:600;">${safeInitial}</span>`;
  const isUsable = /^https?:\/\//i.test(url) || /^data:image\//i.test(url);
  const imgLayer = isUsable
    ? `<img src="${escapeHtml(url)}" alt="" decoding="async" loading="lazy" `
      + `style="position:absolute;inset:0;width:36px;height:36px;border-radius:50%;`
      + `object-fit:cover;display:block;" `
      + `onerror="this.style.display='none';"/>`
    : '';
  return `<span style="position:relative;display:inline-block;width:36px;height:36px;flex:none;">`
    + `${placeholderInner}${imgLayer}`
    + `</span>`;
};

const formatInviter = (cell) => {
  const row = cell.getRow().getData();
  const display = String(row.display_name || '').trim();
  const address = String(row.inviter || '').trim();
  const safeDisplay = display
    ? escapeHtml(display)
    : '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  const safeAddress = escapeHtml(address);
  const addressHref = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
  const thumb = renderAvatarThumb(row.preview_image_url, display || address, address);
  return `<div style="display:flex;align-items:center;gap:10px;min-width:0;">`
    + `${thumb}`
    + `<div style="display:flex;flex-direction:column;min-width:0;line-height:1.25;">`
    +   `<span style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeDisplay}</span>`
    +   (address
          ? `<a href="${addressHref}" target="_blank" rel="noopener noreferrer" `
            + `class="table-link" `
            + `style="font-family:monospace;font-size:11px;color:var(--color-text-secondary,#94a3b8);`
            + `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeAddress}</a>`
          : '')
    + `</div>`
    + `</div>`;
};

const metric = {
  id: 'api_execution_circles_v2_inviters_ranking',
  name: 'Top Inviters',
  description: 'Leaderboard of top inviters by humans invited',
  metricDescription: `**Top Inviters.** Leaderboard of avatars ranked by how many \`Human\` avatars registered in Circles v2 citing them as inviter. \`invite_count\` = distinct humans whose on-chain \`invited_by\` equals this address; self-invites and the zero address are excluded, and only \`avatar_type = 'Human'\` invitees are counted (invited groups/orgs are not). \`Blacklisted\` marks inviters currently on the Circles hub blacklist. \`First\`/\`Last invite\` are the timestamps of that inviter's earliest and latest invited registration. Top 100 by invite count.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 25,
    rowHeight: 56,
    movableColumns: false,
    columns: [
      { title: '#',            field: 'rank',           width: 70,  sorter: 'number',  hozAlign: 'right' },
      { title: 'Inviter',      field: 'display_name',   minWidth: 320, widthGrow: 3, sorter: 'string', formatter: formatInviter },
      { title: 'Blacklisted',  field: 'is_blacklisted', width: 110, sorter: 'boolean', formatter: 'tickCross', hozAlign: 'center' },
      { title: 'Invites',      field: 'invite_count',   width: 110, sorter: 'number',  hozAlign: 'right' },
      { title: 'First invite', field: 'first_invite',   width: 130, sorter: 'string' },
      { title: 'Last invite',  field: 'last_invite',    width: 130, sorter: 'string' },
    ],
  },
  query: `
    SELECT
      rank,
      inviter,
      display_name,
      preview_image_url,
      is_blacklisted,
      invite_count,
      toDate(first_invite_ts) AS first_invite,
      toDate(last_invite_ts)  AS last_invite
    FROM dbt.api_execution_circles_v2_inviters_ranking
    ORDER BY rank
    LIMIT 100
  `,
};
export default metric;
