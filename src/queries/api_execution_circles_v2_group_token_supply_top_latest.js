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

const formatGroupProfile = (cell) => {
  const row = cell.getRow().getData();
  const display = String(row.display_name || '').trim();
  const address = String(row.group_avatar || '').trim();
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

const formatNumberCell = (digits = 0) => (cell) => {
  const v = cell.getValue();
  if (v == null) return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
};

const formatPctCell = (cell) => {
  const v = cell.getValue();
  if (v == null) return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(1) + '%';
};

// Same-tab in-app navigation (mirrors the yields opportunities drill-down):
// pushState + popstate lets Dashboard hydrate the target tab's global filter
// from the URL without a full reload. We navigate on a plain left click and
// only defer to the browser default for modifier / middle clicks (open in new
// tab) — deliberately NOT gating on event.defaultPrevented, which Tabulator's
// rowClick may already have set.
const navigateInApp = (href, event) => {
  if (!href || typeof window === 'undefined') return false;
  if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || Number(event.button) > 0)) {
    return false;
  }
  if (event && typeof event.preventDefault === 'function') event.preventDefault();
  const nextUrl = href.startsWith('?') ? `${window.location.pathname}${href}` : href;
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  if (nextUrl === currentUrl) return false;
  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  return true;
};

const metric = {
  id: 'api_execution_circles_v2_group_token_supply_top_latest',
  name: 'Top Groups by Supply',
  description: 'Leaderboard of Circles v2 groups by personal-token supply',
  metricDescription: `Leaderboard of the **top 100 Circles v2 groups by current personal-token supply** (groups with zero supply excluded), from \`fct_execution_circles_v2_group_token_supply_current\`.

- \`Supply\` — total CRC of that group's personal token in circulation across every holder, native ERC-1155 plus ERC-20 wrapper combined (balances below a 0.001 CRC dust threshold are ignored).
- \`Wrapped\` / \`Wrapped %\` — the CRC amount, and its share of supply, held in the ERC-20 wrapper form.
- \`Members\` — the group's size, i.e. distinct trustees on its outgoing trust list.

Figures are raw (non-demurraged) CRC, ranked by supply descending. Click a row to open that group in the Group Explorer.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 25,
    rowHeight: 56,
    movableColumns: false,
    columns: [
      { title: '#',         field: 'rank',         width: 70,  sorter: 'number', hozAlign: 'right' },
      { title: 'Group',     field: 'display_name', minWidth: 320, widthGrow: 3, sorter: 'string', formatter: formatGroupProfile },
      { title: 'Supply',    field: 'supply',       width: 140, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell(0) },
      { title: 'Wrapped',   field: 'wrapped',      width: 140, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell(0) },
      { title: 'Wrapped %', field: 'wrapped_pct',  width: 110, sorter: 'number', hozAlign: 'right', formatter: formatPctCell },
      { title: 'Members',   field: 'n_members',    width: 110, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell(0) },
    ],
    initialSort: [{ column: 'rank', dir: 'asc' }],
    onRowClick: (rowData, _row, event) => {
      const g = String(rowData.group_avatar || '').toLowerCase();
      if (g) navigateInApp(`?dashboard=circles&tab=group-explorer&group_address=${g}`, event);
    },
  },
  query: `
    SELECT
      rank,
      group_avatar,
      display_name,
      preview_image_url,
      supply,
      wrapped,
      unwrapped,
      wrapped_pct,
      n_members
    FROM dbt.api_execution_circles_v2_group_token_supply_top_latest
    ORDER BY rank
  `,
};
export default metric;
