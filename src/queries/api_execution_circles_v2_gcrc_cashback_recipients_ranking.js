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

const formatRecipientProfile = (cell) => {
  const row = cell.getRow().getData();
  const display = String(row.display_name || '').trim();
  const address = String(row.address || '').trim();
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

const formatNumberCell = (cell) => {
  const v = cell.getValue();
  if (v == null) return '-';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const formatDate = (cell) => {
  const v = cell.getValue();
  if (!v) return '-';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString().slice(0, 10);
};

const metric = {
  id: 'api_execution_circles_v2_gcrc_cashback_recipients_ranking',
  name: 'Top Cashback Recipients',
  description: 'Largest lifetime gCRC cashback recipients',
  metricDescription: `**Top 100 lifetime gCRC cashback recipients.** Ranks addresses by total \`gCRC\` received from the cashback wallet (\`0x7abe…af6a\`) across all weeks. \`Total gCRC\` is the lifetime sum (raw / 1e18) of qualifying weekly cashbacks — only weeks where the address received **≥ 1 gCRC** count; \`Weeks\` is the number of distinct weeks it earned cashback and \`Last week\` its most recent qualifying week. \`gCRC\` is the ERC-20 wrapper of the gCRC group-token avatar; the current incomplete week is excluded, and the display name / avatar come from Circles profile metadata.`,
  chartType: 'table',
  tableConfig: {
    layout: 'fitColumns',
    responsiveLayout: false,
    pagination: true,
    paginationSize: 25,
    rowHeight: 56,
    movableColumns: false,
    columns: [
      { title: '#',          field: 'rank',         width: 70,  sorter: 'number', hozAlign: 'right' },
      { title: 'Recipient',  field: 'display_name', minWidth: 320, widthGrow: 3, sorter: 'string', formatter: formatRecipientProfile },
      { title: 'Total gCRC', field: 'total_amount', width: 150, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell },
      { title: 'Weeks',      field: 'n_weeks',      width: 100, sorter: 'number', hozAlign: 'right', formatter: formatNumberCell },
      { title: 'Last week',  field: 'last_week',    width: 130, sorter: 'datetime', formatter: formatDate },
    ],
    initialSort: [{ column: 'rank', dir: 'asc' }],
  },
  query: `
    SELECT rank, address, display_name, preview_image_url, total_amount, n_weeks, last_week
    FROM dbt.api_execution_circles_v2_gcrc_cashback_recipients_ranking
    ORDER BY rank
  `,
};
export default metric;
