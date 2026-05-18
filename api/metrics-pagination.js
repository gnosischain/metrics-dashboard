const CIRCLES_HOLDINGS_METRIC_ID = 'api_execution_circles_v2_avatar_holdings_by_token';
const CIRCLES_TRUST_RELATIONS_METRIC_ID = 'api_execution_circles_v2_avatar_trust_relations';

const PAGINATED_METRIC_CONFIG = {
  [CIRCLES_HOLDINGS_METRIC_ID]: {
    defaultPageSize: 50,
    maxPageSize: 500,
    defaultSort: [
      { field: 'balance_demurraged', dir: 'DESC' },
      { field: 'token_address', dir: 'ASC' },
    ],
    sortFields: new Set([
      'token_label',
      'token_symbol',
      'token_name',
      'token_address',
      'is_wrapped',
      'balance',
      'balance_demurraged',
    ]),
    searchFields: [
      'token_label',
      'token_symbol',
      'token_name',
      'token_address',
    ],
    alwaysIncludeTotal: true,
  },
  [CIRCLES_TRUST_RELATIONS_METRIC_ID]: {
    defaultPageSize: 50,
    maxPageSize: 500,
    defaultSort: [
      { field: 'direction', dir: 'ASC' },
      { field: 'counterparty', dir: 'ASC' },
    ],
    sortFields: new Set([
      'direction',
      'counterparty',
      'outgoing_from',
      'incoming_from',
    ]),
    searchFields: [
      'direction',
      'counterparty',
    ],
    alwaysIncludeTotal: true,
  },
};

const isSafeIdentifier = (value) =>
  typeof value === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);

const escapeSqlString = (value) =>
  String(value).replace(/\\/g, '\\\\').replace(/'/g, "''");

const clampInteger = (value, fallback, min, max) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};

const stripTrailingOrderBy = (sql) => {
  const lower = String(sql || '').toLowerCase();
  const orderByIdx = lower.lastIndexOf('order by');
  return orderByIdx >= 0 ? sql.slice(0, orderByIdx) : sql;
};

const normalizeSortDir = (value, fallback = 'DESC') =>
  String(value || fallback).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

const normalizeMetricPagination = (metricId, params = {}) => {
  const config = PAGINATED_METRIC_CONFIG[metricId];
  if (!config) return null;

  const pageSize = clampInteger(
    params.pageSize,
    config.defaultPageSize,
    1,
    config.maxPageSize
  );
  const page = clampInteger(params.page, 1, 1, 1000000);
  const offset = params.offset != null
    ? clampInteger(params.offset, 0, 0, 50000000)
    : null;
  const requestedSortField = typeof params.sortField === 'string' ? params.sortField : '';
  const sortField = config.sortFields.has(requestedSortField) ? requestedSortField : null;
  const sortDir = normalizeSortDir(params.sortDir);
  const search = typeof params.search === 'string'
    ? params.search.trim().slice(0, 160)
    : '';

  return {
    metricId,
    page,
    pageSize,
    offset,
    sortField,
    sortDir,
    search,
    includeTotal: Boolean(
      config.alwaysIncludeTotal ||
      params.includeTotal === true ||
      params.includeTotal === 'true'
    ),
    config,
  };
};

const buildPaginationOrderBy = (pagination) => {
  const requestedSort = pagination.sortField
    ? [{ field: pagination.sortField, dir: pagination.sortDir }]
    : [];
  const fallbackSort = pagination.config.defaultSort || [];
  const seen = new Set();

  return [...requestedSort, ...fallbackSort]
    .filter(({ field }) => isSafeIdentifier(field))
    .filter(({ field }) => {
      if (seen.has(field)) return false;
      seen.add(field);
      return true;
    })
    .map(({ field, dir }) => `${field} ${normalizeSortDir(dir, 'ASC')}`)
    .join(', ');
};

const buildSearchCondition = (pagination) => {
  if (!pagination.search) return '';
  const searchLiteral = `'${escapeSqlString(pagination.search)}'`;
  const conditions = (pagination.config.searchFields || [])
    .filter(isSafeIdentifier)
    .map((field) => `positionCaseInsensitive(toString(${field}), ${searchLiteral}) > 0`);

  return conditions.length > 0 ? conditions.join(' OR ') : '';
};

const buildPaginatedMetricSql = (processedQuery, pagination) => {
  const baseQuery = stripTrailingOrderBy(processedQuery);
  const searchCondition = buildSearchCondition(pagination);
  const scopedQuery = searchCondition
    ? `
        SELECT *
        FROM (
          ${baseQuery}
        )
        WHERE ${searchCondition}
      `
    : `
        SELECT *
        FROM (
          ${baseQuery}
        )
      `;
  const offset = pagination.offset ?? ((pagination.page - 1) * pagination.pageSize);
  const orderBy = buildPaginationOrderBy(pagination);
  const countQuery = `SELECT count() AS total FROM (${scopedQuery})`;
  const query = `
    SELECT *
    FROM (
      ${scopedQuery}
    )
    ORDER BY ${orderBy}
    LIMIT ${pagination.pageSize}
    OFFSET ${offset}
  `;

  return {
    query,
    countQuery,
    offset,
    orderBy,
  };
};

module.exports = {
  CIRCLES_HOLDINGS_METRIC_ID,
  CIRCLES_TRUST_RELATIONS_METRIC_ID,
  PAGINATED_METRIC_CONFIG,
  buildPaginatedMetricSql,
  buildPaginationOrderBy,
  clampInteger,
  escapeSqlString,
  isSafeIdentifier,
  normalizeMetricPagination,
  stripTrailingOrderBy,
};
