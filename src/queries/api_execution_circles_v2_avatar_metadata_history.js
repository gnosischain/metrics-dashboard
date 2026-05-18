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

const formatValidTo = (cell) => {
  const v = cell.getValue();
  if (!v) {
    return '<span style="color:var(--color-success,#22c55e);font-weight:600;">current</span>';
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().replace('T', ' ').slice(0, 16);
};

const formatIsCurrent = (cell) => {
  const v = cell.getValue();
  if (v === true || v === 1 || v === '1') {
    return '<span style="color:var(--color-success,#22c55e);font-size:18px;line-height:1;">●</span>';
  }
  return '<span style="color:var(--color-text-secondary,#94a3b8);">○</span>';
};

// Deterministic colour for the placeholder circle.
const colorFromKey = (key) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const palette = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];
  return palette[hash % palette.length];
};

// Renders a 36×36 round avatar with image-or-placeholder layering.
// See api_execution_circles_v2_avatar_metadata.js for the rationale —
// the layered approach avoids HTML interpolation in onerror handlers.
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

// Combined Profile cell — image (or placeholder) + display name.
const formatProfile = (cell) => {
  const row = cell.getRow().getData();
  const img = row.metadata_preview_image_url || row.metadata_image_url || '';
  const display = String(row.metadata_name || '').trim();
  const safeDisplay = display
    ? escapeHtml(display)
    : '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  // Key on metadata_digest so each historical version gets a stable
  // (but distinct) placeholder colour, instead of all rows for the same
  // avatar collapsing to the same hue.
  const thumb = renderAvatarThumb(img, display || row.avatar, row.metadata_digest || row.avatar);
  return `<div style="display:flex;align-items:center;gap:10px;min-width:0;">`
    + `${thumb}`
    + `<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeDisplay}</span>`
    + `</div>`;
};

const formatTruncated = (limit) => (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  const safe = escapeHtml(v);
  if (v.length <= limit) return safe;
  return `<span title="${safe}">${escapeHtml(v.slice(0, limit))}…</span>`;
};

const formatCidLink = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '-';
  const href = `https://ipfs.io/ipfs/${encodeURIComponent(v)}`;
  const safe = escapeHtml(v);
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" `
    + `style="font-family:monospace;">${safe.slice(0, 10)}…${safe.slice(-6)}</a>`;
};

const formatTxLink = (cell) => {
  const v = String(cell.getValue() || '').trim();
  if (!v) return '-';
  const normalized = v.startsWith('0x') ? v : `0x${v}`;
  const href = `https://gnosis.blockscout.com/tx/${encodeURIComponent(normalized)}`;
  return `<a class="table-link" href="${href}" target="_blank" rel="noopener noreferrer" `
    + `style="font-family:monospace;">${normalized.slice(0, 10)}…${normalized.slice(-6)}</a>`;
};

const metric = {
  id: 'api_execution_circles_v2_avatar_metadata_history',
  name: 'Metadata History',
  description: 'Every IPFS profile change for the selected avatar',
  metricDescription: 'Full timeline of metadata updates for the selected Circles v2 avatar. Each row is one UpdateMetadataDigest event with the parsed display name, preview image, and description from the IPFS payload at that point in time. The most recent version is flagged.',
  chartType: 'table',
  globalFilterField: 'avatar',
  useCached: false,

  tableConfig: {
    layout: 'fitColumns',
    pagination: false,
    responsiveLayout: false,
    height: '100%',
    rowHeight: 56,
    movableColumns: false,
    initialSort: [{ column: 'valid_from', dir: 'desc' }],
    columns: [
      {
        title: '',
        field: 'is_current',
        width: 50,
        hozAlign: 'center',
        headerSort: false,
        formatter: formatIsCurrent,
      },
      {
        title: 'Profile',
        field: 'metadata_name',
        minWidth: 220,
        widthGrow: 2,
        sorter: 'string',
        formatter: formatProfile,
      },
      {
        title: 'Description',
        field: 'metadata_description',
        minWidth: 220,
        widthGrow: 2,
        sorter: 'string',
        formatter: formatTruncated(120),
      },
      {
        title: 'Valid From',
        field: 'valid_from',
        width: 160,
        sorter: 'string',
        formatter: formatDateTime,
      },
      {
        title: 'Valid To',
        field: 'valid_to',
        width: 160,
        sorter: 'string',
        formatter: formatValidTo,
      },
      {
        title: 'IPFS CID',
        field: 'ipfs_cid_v0',
        width: 200,
        sorter: 'string',
        formatter: formatCidLink,
      },
      {
        title: 'Tx',
        field: 'transaction_hash',
        width: 200,
        sorter: 'string',
        formatter: formatTxLink,
      },
    ],
  },

  query: `
    SELECT
      avatar,
      metadata_digest,
      ipfs_cid_v0,
      metadata_name,
      metadata_description,
      metadata_image_url,
      metadata_preview_image_url,
      valid_from,
      valid_to,
      is_current,
      transaction_hash,
      log_index
    FROM dbt.int_execution_circles_v2_avatar_metadata_history
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY valid_from DESC
    LIMIT 100
  `,
};

export default metric;
