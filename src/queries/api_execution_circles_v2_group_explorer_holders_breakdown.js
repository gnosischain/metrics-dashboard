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

const formatHolderProfile = (cell) => {
  const row = cell.getRow().getData();
  const display = String(row.display_name || '').trim();
  const address = String(row.holder || '').trim();
  const safeDisplay = display && display !== address
    ? escapeHtml(display)
    : '<span style="color:var(--color-text-secondary,#94a3b8);">—</span>';
  const safeAddress = escapeHtml(address);
  const addressHref = `https://gnosis.blockscout.com/address/${encodeURIComponent(address)}`;
  const thumb = renderAvatarThumb('', display || address, address);
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

const formatBalance = (cell) => {
  const v = cell.getValue();
  if (v == null) return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatWrapped = (cell) => (cell.getValue() ? 'ERC-20' : 'ERC-1155');

const metric = {
  id: 'api_execution_circles_v2_group_explorer_holders_breakdown',
  name: 'Top Holders',
  description: 'Largest holders of the group token',
  metricDescription: `The 50 largest holders of this group's token, ranked by balance. Each holder's balance sums both legs of the token — native ERC-1155 CRC (\`token_address\` = the group avatar) and the ERC-20 wrapper (mapped back to the group via the wrapper registry) — and is shown in nominal CRC (not demurrage-adjusted); only positive balances are included. The \`Token\` column labels a holder as \`ERC-20\` if any part of their balance is wrapped, otherwise \`ERC-1155\`.`,
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
      { title: 'Holder',  field: 'display_name', minWidth: 320, widthGrow: 3, sorter: 'string', formatter: formatHolderProfile },
      { title: 'Token',   field: 'is_wrapped',   width: 110, sorter: 'boolean', formatter: formatWrapped, hozAlign: 'center' },
      { title: 'Balance', field: 'balance',      width: 160, sorter: 'number', hozAlign: 'right', formatter: formatBalance },
    ],
    initialSort: [{ column: 'balance', dir: 'desc' }],
  },

  query: `
    SELECT
      group_address,
      holder,
      display_name,
      is_wrapped,
      balance
    FROM dbt.api_execution_circles_v2_group_holders
    WHERE 1 = 1
      /*__FILTER_CONDITIONS__*/
    ORDER BY balance DESC
    LIMIT 50
  `,
};

export default metric;
