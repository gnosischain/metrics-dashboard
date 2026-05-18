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

// Deterministic colour for an avatar address so the placeholder
// circle stays consistent across reloads.
const colorFromKey = (key) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const palette = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];
  return palette[hash % palette.length];
};

// Renders a 36×36 round avatar — image if a usable source is present,
// otherwise a coloured circle with the first letter of the display name.
//
// Accepts both `https://...` URLs and `data:image/...` base64 payloads
// (Circles avatar profiles publish previewImageUrl as a base64 data URL
// for most accounts).
//
// Implementation: a layered wrapper with the colored-letter placeholder
// underneath and the <img> on top. If the image loads it covers the
// placeholder; if it errors, onerror just hides the img and the
// placeholder shows through. No string-interpolated HTML in onerror —
// that broke when the placeholder span had double quotes that collided
// with the onerror="..." attribute.
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

// "Profile" cell — image (or placeholder) on the left, then a stacked
// block on the right with the display name on top and the full avatar
// address (linked to Blockscout) directly underneath in monospace.
// Falls back to on-chain name when the IPFS name is empty.
const formatProfile = (cell) => {
  const row = cell.getRow().getData();
  const img = row.metadata_preview_image_url || row.metadata_image_url || '';
  const display = String(row.metadata_name || '').trim() || String(row.name || '').trim() || '';
  const safeDisplay = display
    ? escapeHtml(display)
    : '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  const address = String(row.avatar || '').trim();
  const safeAddress = escapeHtml(address);
  const addressHref = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
  const thumb = renderAvatarThumb(img, display || row.avatar, row.avatar);
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
  id: 'api_execution_circles_v2_avatar_metadata',
  name: 'Avatar Identity',
  description: 'Registration facts for the selected avatar',
  metricDescription: 'Static registration facts for the selected Circles v2 avatar — type, who invited them, and when they registered. The current display name and preview image are shown alongside as a header card. Mutable profile fields (description, IPFS CID, full history of name/image changes) live in the "Metadata History" panel below.',
  chartType: 'table',
  globalFilterField: 'avatar',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: false,
    height: '100%',
    rowHeight: 64,
    movableColumns: false,
    columns: [
      {
        title: 'Profile',
        field: 'metadata_name',
        minWidth: 320,
        widthGrow: 3,
        sorter: 'string',
        formatter: formatProfile,
      },
      { title: 'Type', field: 'avatar_type', width: 90, sorter: 'string' },
      {
        title: 'Registered',
        field: 'registered_at',
        width: 160,
        sorter: 'datetime',
        formatter: formatDateTime,
      },
      {
        title: 'Invited By',
        field: 'invited_by',
        minWidth: 180,
        widthGrow: 1,
        sorter: 'string',
        formatter: formatAddressLink,
      },
    ],
  },

  query: `
    SELECT
      avatar,
      avatar_type,
      invited_by,
      name,
      registered_at,
      metadata_name,
      metadata_image_url,
      metadata_preview_image_url
    FROM dbt.api_execution_circles_v2_avatar_metadata
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
  `,
};

export default metric;
