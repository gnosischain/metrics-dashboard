const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatDateTime = (cell) => {
  const v = cell.getValue();
  if (!v) return '-';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().replace('T', ' ').slice(0, 16);
};

const formatAddressLink = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v || v === '0x0000000000000000000000000000000000000000') return '-';
  const href = `https://gnosis.blockscout.com/address/${encodeURIComponent(v)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer">${v.slice(0, 10)}...${v.slice(-6)}</a>`;
};

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

const formatGroupProfile = (cell) => {
  const row = cell.getRow().getData();
  const display = String(row.display_name || '').trim();
  const address = String(row.group_address || '').trim();
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
  id: 'api_execution_circles_v2_group_explorer_metadata',
  name: 'Group Identity',
  description: 'Registration, profile and on-chain handlers for the selected group',
  metricDescription: `Registration facts, profile, and on-chain handlers (\`owner\`, \`treasury_address\`, \`mint_handler\`, \`redemption_handler\`) for the selected Circles v2 group. Each handler is resolved from the group's settings-update history using its last **non-empty** value, so some group types (e.g. score-based) may leave them empty. Name/image are the group's latest avatar metadata, and \`Members\` is the size of its current outgoing trust list.`,
  chartType: 'table',
  globalFilterField: 'group_address',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    height: '100%',
    rowHeight: 64,
    movableColumns: false,
    columns: [
      { title: 'Group',      field: 'display_name',      minWidth: 300, widthGrow: 3, sorter: 'string', formatter: formatGroupProfile },
      { title: 'Members',    field: 'n_members',         width: 100, sorter: 'number', hozAlign: 'right' },
      { title: 'Owner',      field: 'owner',             minWidth: 160, widthGrow: 1, sorter: 'string', formatter: formatAddressLink },
      { title: 'Treasury',   field: 'treasury_address',  minWidth: 160, widthGrow: 1, sorter: 'string', formatter: formatAddressLink },
      { title: 'Registered', field: 'registered_at',     width: 160, sorter: 'datetime', formatter: formatDateTime },
    ],
  },

  query: `
    SELECT
      group_address,
      display_name,
      preview_image_url,
      n_members,
      owner,
      treasury_address,
      service,
      mint_handler,
      redemption_handler,
      registered_at
    FROM dbt.api_execution_circles_v2_group_explorer_profile
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
