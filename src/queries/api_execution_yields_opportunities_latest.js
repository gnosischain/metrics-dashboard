import { getTokenIconHtml, getTokenIconsFromName, formatTokenName } from '../utils/tokenIcons.js';

const OPPORTUNITY_NAME_SUFFIX_PATTERN = /\s*[•·]\s*[a-fA-F0-9x]{4,}$/;

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatPercentage = (value, { hideZero = false } = {}) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "-";
  if (hideZero && Number(value) === 0) return "-";
  return Number(value).toFixed(2) + "%";
};

const formatCompactCurrency = (value) => {
  if (value === null || value === undefined || Number(value) === 0 || Number.isNaN(Number(value))) return "-";
  const numericValue = Number(value);
  if (numericValue >= 1e6) return "$" + (numericValue / 1e6).toFixed(1) + "M";
  if (numericValue >= 1e3) return "$" + (numericValue / 1e3).toFixed(1) + "K";
  return "$" + numericValue.toFixed(0);
};

const normalizeTrendValues = (values) => (
  (() => {
    if (Array.isArray(values)) {
      return values;
    }

    if (typeof values === 'string') {
      const trimmed = values.trim();
      if (!trimmed) {
        return [];
      }

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (_error) {
          // Fall through to a simple comma split.
        }
      }

      return trimmed.split(',').map(value => value.trim());
    }

    return [];
  })()
    .map(value => Number(value))
    .filter(value => Number.isFinite(value))
);

const getTrendSortValue = (values) => {
  const normalizedValues = normalizeTrendValues(values);
  return normalizedValues.length > 0 ? normalizedValues[normalizedValues.length - 1] : Number.NEGATIVE_INFINITY;
};

export const cleanOpportunityName = (name) => String(name || '-')
  .replace(OPPORTUNITY_NAME_SUFFIX_PATTERN, '')
  .trim();

export const buildOpportunityHref = (row = {}) => {
  const token = String(row.token || '').trim();
  if (!token) {
    return null;
  }

  const params = new URLSearchParams({ dashboard: 'yields', token });

  if (String(row.type || '').trim() === 'LP') {
    const poolKey = String(row.pool_key || cleanOpportunityName(row.name) || '').trim();
    if (!poolKey || poolKey === '-') {
      return null;
    }

    params.set('tab', 'pools');
    params.set('pool', poolKey);
    return `?${params.toString()}`;
  }

  params.set('tab', 'lending');
  return `?${params.toString()}`;
};

export const buildSparklineSvg = (values, { stroke = '#2563eb' } = {}) => {
  const normalizedValues = normalizeTrendValues(values);
  if (normalizedValues.length < 2) {
    return "-";
  }

  const width = 92;
  const height = 28;
  const padding = 2;
  const minValue = Math.min(...normalizedValues);
  const maxValue = Math.max(...normalizedValues);
  const valueRange = maxValue - minValue || 1;
  const drawableWidth = width - (padding * 2);
  const drawableHeight = height - (padding * 2);

  const points = normalizedValues.map((value, index) => {
    const x = padding + ((drawableWidth * index) / (normalizedValues.length - 1));
    const y = padding + (drawableHeight - (((value - minValue) / valueRange) * drawableHeight));
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  const lastX = padding + drawableWidth;
  const lastY = padding + (drawableHeight - (((normalizedValues[normalizedValues.length - 1] - minValue) / valueRange) * drawableHeight));
  const latestValue = normalizedValues[normalizedValues.length - 1];

  return [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" `,
    `xmlns="http://www.w3.org/2000/svg" role="img" aria-label="14 day rate trend ending at ${latestValue.toFixed(2)}%">`,
    `<polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
    `<circle cx="${lastX.toFixed(2)}" cy="${lastY.toFixed(2)}" r="2.5" fill="${stroke}" />`,
    `</svg>`
  ].join('');
};

const formatOpportunityNameCell = (cell) => {
  const name = cell.getValue();
  const row = cell.getRow()?.getData?.() || {};
  const cleanName = cleanOpportunityName(name);
  const displayName = formatTokenName(cleanName);
  const safeName = escapeHtml(displayName);
  const href = buildOpportunityHref(row);

  const icons = row.type === 'LP'
    ? getTokenIconsFromName(cleanName)
    : (getTokenIconHtml(row.token) || getTokenIconsFromName(cleanName));
  const iconSpan = icons ? `<span style="margin-right:8px;flex-shrink:0;">${icons}</span>` : '';

  if (!href) {
    return `<span style="display:inline-flex;align-items:center;">${iconSpan}${safeName}</span>`;
  }

  return `<span style="display:inline-flex;align-items:center;">${iconSpan}<a class="table-link" href="${href}">${safeName}</a></span>`;
};

const handleOpportunityNameClick = (event, cell) => {
  const href = buildOpportunityHref(cell.getRow()?.getData?.() || {});
  if (!href || typeof window === 'undefined') {
    return;
  }

  if (event?.target?.closest?.('a')) {
    return;
  }

  window.location.assign(href);
};

const getOpportunityTooltip = (cell) => {
  const row = cell.getRow()?.getData?.() || {};
  const href = buildOpportunityHref(row);
  if (!href) return false;

  if (String(row.type || '').trim() === 'LP') {
    const poolKey = String(row.pool_key || cleanOpportunityName(row.name) || '').trim();
    return poolKey ? `Open ${poolKey} in Yields > Pools` : 'Open pool view';
  }

  const token = String(row.token || '').trim();
  return token ? `Open ${token} in Yields > Lending` : 'Open lending view';
};

const formatTrendCell = (cell) => {
  const row = cell.getRow()?.getData?.() || {};
  const stroke = row.type === 'LP' ? '#2563eb' : '#16a34a';
  return buildSparklineSvg(cell.getValue(), { stroke });
};

const getTrendTooltip = (cell) => {
  const row = cell.getRow()?.getData?.() || {};
  const values = normalizeTrendValues(cell.getValue());
  if (values.length < 2) {
    return false;
  }

  const latestValue = values[values.length - 1];
  const label = row.type === 'LP' ? 'APR' : 'APY';
  return `${label} 14D trend • latest ${latestValue.toFixed(2)}%`;
};

const metric = {
  id: 'api_execution_yields_opportunities_latest',
  name: 'Yield Opportunities',
  description: 'Pools & lending ranked by yield',
  metricDescription: 'Current yield opportunities across LP pools and lending markets on Gnosis Chain. Rows are ranked by yield to compare candidates quickly.',
  chartType: 'table',
  enableFiltering: true,
  labelField: 'type',

  tableConfig: {
    layout: 'fitColumns',
    pagination: true,
    paginationSize: 20,
    paginationSizeSelector: false,
    responsiveLayout: 'collapse',
    height: '100%',
    movableColumns: false,
    hideEmptyColumns: true,
    searchFields: ['protocol', 'token', 'name', 'type'],
    initialSort: [{ column: 'tvl', dir: 'desc' }],

    columns: [
      {
        title: "",
        field: "address",
        visible: false
      },
      {
        title: "",
        field: "token",
        visible: false
      },
      {
        title: "",
        field: "pool_key",
        visible: false
      },
      {
        title: "Type",
        field: "type",
        minWidth: 80,
        widthGrow: 1,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      },
      {
        title: "Name",
        field: "name",
        minWidth: 200,
        widthGrow: 3,
        sorter: "string",
        headerFilter: false,
        formatter: formatOpportunityNameCell,
        cellClick: handleOpportunityNameClick,
        tooltip: getOpportunityTooltip
      },
      {
        title: "APR 14D",
        field: "rate_trend_14d",
        minWidth: 130,
        widthGrow: 1.4,
        hozAlign: "center",
        headerFilter: false,
        formatter: formatTrendCell,
        tooltip: getTrendTooltip,
        sorter: function(a, b) {
          return getTrendSortValue(a) - getTrendSortValue(b);
        }
      },
      {
        title: "Yield APR",
        field: "yield_apr",
        minWidth: 130,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatPercentage(cell.getValue());
        }
      },
      {
        title: "Fee Tier",
        field: "fee_pct",
        minWidth: 80,
        widthGrow: 0.8,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatPercentage(cell.getValue());
        }
      },
      {
        title: "Yield APY",
        field: "yield_apy",
        minWidth: 130,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatPercentage(cell.getValue());
        }
      },
      {
        title: "Borrow %",
        field: "borrow_apy",
        minWidth: 110,
        widthGrow: 1,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatPercentage(cell.getValue(), { hideZero: true });
        }
      },
      {
        title: "TVL",
        field: "tvl",
        minWidth: 120,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatCompactCurrency(cell.getValue());
        }
      },
      {
        title: "Total Supplied",
        field: "total_supplied",
        minWidth: 120,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatCompactCurrency(cell.getValue());
        }
      },
      {
        title: "Total Borrowed",
        field: "total_borrowed",
        minWidth: 120,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatCompactCurrency(cell.getValue());
        }
      },
      {
        title: "Fees 7D",
        field: "fees_7d",
        minWidth: 110,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatCompactCurrency(cell.getValue());
        }
      },
      {
        title: "Vol 7D",
        field: "volume_usd_7d",
        minWidth: 110,
        widthGrow: 1.5,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          return formatCompactCurrency(cell.getValue());
        }
      },
      {
        title: "Util %",
        field: "utilization_rate",
        minWidth: 90,
        widthGrow: 1,
        sorter: "number",
        hozAlign: "right",
        headerFilter: false,
        formatter: function(cell) {
          const val = cell.getValue();
          if (val === null || val === undefined) return "-";
          const pct = Number(val).toFixed(1);
          if (Number(val) >= 85) return "<span style='color:#e53e3e;font-weight:600'>" + pct + "%</span>";
          if (Number(val) >= 70) return "<span style='color:#d69e2e;font-weight:600'>" + pct + "%</span>";
          return pct + "%";
        }
      },
      {
        title: "Protocol",
        field: "protocol",
        minWidth: 120,
        widthGrow: 1.5,
        sorter: "string",
        formatter: "plaintext",
        headerFilter: false
      }
    ]
  },

  query: `
    SELECT
      type,
      token,
      name,
      address,
      pool_key,
      rate_trend_14d,
      fee_pct,
      yield_apr,
      yield_apy,
      borrow_apy,
      tvl,
      total_supplied,
      total_borrowed,
      fees_7d,
      volume_usd_7d,
      utilization_rate,
      protocol
    FROM dbt.api_execution_yields_opportunities_latest
  `,
};

export default metric;
