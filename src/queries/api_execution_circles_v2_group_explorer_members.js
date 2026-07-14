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

const formatMemberProfile = (cell) => {
  const row = cell.getRow().getData();
  const display = String(row.display_name || '').trim();
  const address = String(row.member || '').trim();
  const safeDisplay = display && display !== address
    ? escapeHtml(display)
    : '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  const safeAddress = escapeHtml(address);
  const addressHref = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
  const thumb = renderAvatarThumb(row.preview_image_url, display || address, address);
  return `<div style="display:flex;align-items:center;gap:10px;min-width:0;">`
    + `${thumb}`
    + `<div style="display:flex;flex-direction:column;min-width:0;line-height:1.25;">`
    +   `<span style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeDisplay}</span>`
    +   `<a href="${addressHref}" target="_blank" rel="noopener noreferrer" `
    +     `class="table-link" `
    +     `style="font-family:monospace;font-size:11px;color:var(--color-text-secondary,#94a3b8);`
    +     `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeAddress}</a>`
    + `</div>`
    + `</div>`;
};

const formatDate = (cell) => {
  const v = cell.getValue();
  if (!v) return '-';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
};

const formatScore = (cell) => {
  const v = cell.getValue();
  if (v === null || v === undefined || v === '') {
    return '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  }
  return String(v);
};

const metric = {
  id: 'api_execution_circles_v2_group_explorer_members',
  name: 'Members',
  description: 'Accounts the group trusts',
  metricDescription: `Current members of the group — every address on its **active outgoing trust list** (trust edges still valid now, i.e. \`valid_to\` in the future). \`Member since\` = when the current trust edge took effect (\`valid_from\`), not necessarily the first-ever trust. \`Mutual\` marks members who also currently trust the group back. Profile name/image come from the latest avatar metadata; rows link out to Blockscout. \`Score\` is the member's latest on-chain mint score for score-based groups (blank otherwise). The **500 most recently-added members** are shown (the KPI tile has the full count).`,
  chartType: 'table',
  globalFilterField: 'group_address',

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 25,
    rowHeight: 56,
    movableColumns: false,
    columns: [
      { title: 'Member',   field: 'display_name', minWidth: 320, widthGrow: 3, sorter: 'string', formatter: formatMemberProfile },
      { title: 'Score',    field: 'score',        width: 90,  sorter: 'number', hozAlign: 'right', formatter: formatScore },
      { title: 'Mutual',   field: 'is_mutual',    width: 100, sorter: 'boolean', formatter: 'tickCross', hozAlign: 'center' },
      { title: 'Member since', field: 'member_since', width: 140, sorter: 'datetime', formatter: formatDate },
    ],
    initialSort: [{ column: 'member_since', dir: 'desc' }],
  },

  query: `
    SELECT
      group_address,
      member,
      display_name,
      preview_image_url,
      member_since,
      is_mutual,
      score
    FROM dbt.api_execution_circles_v2_group_members
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY member_since DESC
    LIMIT 500
  `,
};

export default metric;
