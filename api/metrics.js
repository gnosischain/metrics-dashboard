const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mockData = require('./mock');
const cacheManager = require('./cache');
const cronManager = require('./cron');

module.exports.config = {
  maxDuration: 60
};

const DEBUG_METRICS = process.env.DEBUG_METRICS === 'true';

const metricLog = (...args) => {
  if (DEBUG_METRICS) console.log(...args);
};

const summarizeForLog = (value) => {
  if (typeof value === 'string') {
    if (/^data:image\//i.test(value)) {
      return `[data-image ${value.length} chars]`;
    }
    return value.length > 180 ? `${value.slice(0, 180)}... (${value.length} chars)` : value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 3).map(summarizeForLog);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, fieldValue]) => [key, summarizeForLog(fieldValue)])
    );
  }

  return value;
};

const getSafeErrorMessage = (error) => {
  const status = error?.response?.status;
  const exception = error?.response?.data?.exception || error?.response?.data?.message;
  return [
    error?.message || 'Unknown error',
    status ? `status ${status}` : '',
    exception ? String(exception).replace(/\s+/g, ' ').slice(0, 300) : '',
  ].filter(Boolean).join(' · ');
};

const cacheValue = (value) => {
  const str = String(value ?? '');
  if (str.length <= 48) return str;
  return `${str.slice(0, 16)}_${crypto.createHash('sha1').update(str).digest('hex').slice(0, 12)}`;
};

const INLINE_FILTER_MARKER = '/*__FILTER_CONDITIONS__*/';
const FILTERED_QUERY_CACHE_VERSION = 'v3';
const VALIDATOR_MEMBERS_METRIC_ID = 'api_consensus_validators_explorer_members_table';
const ACCOUNT_COUNTERPARTY_GRAPH_METRIC_ID = 'api_execution_account_counterparty_graph';
const CIRCLES_TRUST_NETWORK_METRIC_ID = 'api_execution_circles_v2_avatar_trust_network';

const VALIDATOR_MEMBERS_SORT_FIELDS = new Set([
  'validator_index',
  'status',
  'slashed',
  'activation_date',
  'exit_date',
  'balance_gno',
  'effective_balance_gno',
  'apy_30d',
  'consensus_income_amount_30d_gno',
  'proposed_blocks_count_lifetime',
  'proposer_reward_total_lifetime_gno',
  'total_income_estimated_gno',
  'withdrawal_address',
  'pubkey',
  'withdrawal_credentials'
]);

const VALIDATOR_MEMBERS_SEARCH_FIELDS = [
  'validator_index',
  'status',
  'withdrawal_address',
  'pubkey',
  'withdrawal_credentials'
];

const isScopedFilteredMetric = (metricId) => {
  const id = String(metricId || '');
  return (
    id.startsWith('api_execution_account_') ||
    id.startsWith('api_execution_gpay_user_') ||
    id.startsWith('api_execution_yields_user_') ||
    id.startsWith('api_execution_circles_v2_avatar_') ||
    id.startsWith('api_execution_gnosis_app_user_') ||
    id.startsWith('api_consensus_validator_compare_') ||
    id.startsWith('api_consensus_validator_group_') ||
    id.startsWith('api_consensus_validator_history_') ||
    id.startsWith('api_consensus_validator_profile_')
  );
};

/**
 * Load all query definitions from JSON files
 * @returns {Object} Object with metric IDs as keys and query strings as values
 */
function loadQueries() {
  const queriesDir = path.join(__dirname, 'queries');
  const queries = {};
  
  // If the queries directory doesn't exist, return default queries
  if (!fs.existsSync(queriesDir)) {
    return getDefaultQueries();
  }
  
  // Read all JSON files in the queries directory
  try {
    const files = fs.readdirSync(queriesDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const queryPath = path.join(queriesDir, file);
        const queryContent = fs.readFileSync(queryPath, 'utf8');
        
        try {
          const queryDef = JSON.parse(queryContent);
          
          if (queryDef.id && queryDef.query) {
            queries[queryDef.id] = queryDef.query;
          }
        } catch (parseError) {
          console.error(`Error parsing JSON in ${file}:`, parseError);
        }
      }
    }
    
    // If no queries were loaded, return default queries
    if (Object.keys(queries).length === 0) {
      return getDefaultQueries();
    }
    
    return queries;
  } catch (error) {
    console.error('Error loading queries:', error);
    return getDefaultQueries();
  }
}

/**
 * Get default queries if no custom queries are found
 * @returns {Object} Object with metric IDs as keys and query strings as values
 */
function getDefaultQueries() {
  return {
    // Add the historical_yield_sdai query here as a fallback
    historical_yield_sdai: `
      SELECT 
        date, 
        apy, 
        label 
      FROM dbt.yields_sdai_apy_daily 
      WHERE date >= '{from}' 
      ORDER BY date ASC, label ASC
    `,
    
    // Number of queries executed
    queryCount: `
      SELECT 
        toDate(event_time) AS date, 
        count() AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'QueryStart'
      GROUP BY date
      ORDER BY date
    `,
    
    // Amount of data processed - Complex multi-column query
    dataSize: `
      SELECT 
        toStartOfHour(t2.created_at) AS hour
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='Lighthouse',1,0)) AS Lighthouse
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='teku',1,0)) AS Teku
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='lodestar',1,0)) AS Lodestar
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='nimbus',1,0)) AS Nimbus
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='erigon',1,0)) AS Erigon
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='',1,0)) AS Unknown
      FROM    
        nebula.visits t1
      INNER JOIN
        nebula.crawls t2
        ON t2.id = t1.crawl_id
      WHERE
        peer_properties.next_fork_version LIKE '%064'
        AND t2.created_at BETWEEN '{from}' AND '{to} 23:59:59'
      GROUP BY 1
      ORDER BY 1
    `,
    
    // Average query duration
    queryDuration: `
      SELECT 
        toDate(event_time) AS date, 
        avg(query_duration_ms) / 1000 AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'QueryFinish'
      GROUP BY date
      ORDER BY date
    `,
    
    // Error rate percentage
    errorRate: `
      SELECT 
        toDate(event_time) AS date, 
        countIf(exception != '') * 100 / count() AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'ExceptionWhileProcessing'
      GROUP BY date
      ORDER BY date
    `
  };
}

const startupQueries = loadQueries();
const startupMetricIds = Object.keys(startupQueries);

metricLog(`Loaded ${startupMetricIds.length} metric queries`);
metricLog(`Metric query ids: ${startupMetricIds.join(', ')}`);

function getActiveQueries(isLocalDevRuntime = false) {
  if (isLocalDevRuntime) {
    const queries = loadQueries();
    return {
      queries,
      availableMetrics: Object.keys(queries)
    };
  }

  return {
    queries: startupQueries,
    availableMetrics: startupMetricIds
  };
}

// Cache warming on module load is disabled by default.
// Previous behavior refreshed all 406 metrics on every serverless cold start,
// which never completed within Vercel's function timeout and saturated ClickHouse.
// The per-request handler below still populates the cache lazily on miss.
// To run a full warm-up, hit /api/cron-refresh (wired to Vercel Cron) or set
// ENABLE_STARTUP_CACHE_REFRESH=1 explicitly.
if (process.env.ENABLE_STARTUP_CACHE_REFRESH === '1') {
  (async () => {
    try {
      await cronManager.checkAndRefreshIfNeeded(startupQueries);
    } catch (error) {
      console.error('Error checking/refreshing cache:', error);
    }
  })();
}

/**
 * Vercel API handler for metrics
 */
module.exports = async (req, res) => {
  const requestHost = String(req.headers?.host || '');
  const isLocalHostRequest = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(requestHost);
  const isLocalDevRuntime =
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.VERCEL_DEV === '1' ||
    isLocalHostRequest;

  if (isLocalDevRuntime) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
  }

  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verify API key for authentication
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or missing API key' 
    });
  }
  
  try {
    const { queries: activeQueries, availableMetrics } = getActiveQueries(isLocalDevRuntime);

    // Parse metric ID from URL path or query parameters
    let metricId = req.query.metricId; // For /api/metrics?metricId=xxx requests
    
    // FIXED: Better URL parsing for /api/metric/xxx or /api/metrics/xxx requests
    if (!metricId && req.url) {
      const urlMatch = req.url.match(/\/api\/metrics?\/([^?&]+)/);
      if (urlMatch) {
        metricId = decodeURIComponent(urlMatch[1]);
        metricLog(`Extracted metric ID from URL: ${metricId}`);
      }
    }
    
    const useMock = req.query.useMock === 'true' || process.env.USE_MOCK_DATA === 'true';
    const rawUseCached = Array.isArray(req.query.useCached) ? req.query.useCached[0] : req.query.useCached;
    const hasUseCachedOverride = rawUseCached !== undefined;
    const useCached = hasUseCachedOverride
      ? rawUseCached !== 'false'
      : !isLocalDevRuntime;

    // Optional, backwards-compatible query params:
    // - from/to: override date placeholders if provided (default behavior unchanged if omitted)
    // - filterField/filterValue: apply server-side filtering by wrapping the metric query
    // - filterField2/filterValue2: optional second filter (ANDed with the first)
    // Normalise `+` to space for filterValue params. URLSearchParams encodes spaces
    // as `+` (form-encoding); Express/Vercel's default query parser leaves `+` intact,
    // so 'Aave V3' round-trips as 'Aave+V3' and fails to match. Decode it here.
    const normalizeValue = (v) => typeof v === 'string' ? v.replace(/\+/g, ' ') : null;
    const requestFrom = typeof req.query.from === 'string' ? req.query.from : null;
    const requestTo = typeof req.query.to === 'string' ? req.query.to : null;
    const requestFilterField = typeof req.query.filterField === 'string' ? req.query.filterField : null;
    const requestFilterValue = normalizeValue(req.query.filterValue);
    const requestFilterField2 = typeof req.query.filterField2 === 'string' ? req.query.filterField2 : null;
    const requestFilterValue2 = normalizeValue(req.query.filterValue2);
    const requestFilterField3 = typeof req.query.filterField3 === 'string' ? req.query.filterField3 : null;
    const requestFilterValue3 = normalizeValue(req.query.filterValue3);
    const requestPage = typeof req.query.page === 'string' ? req.query.page : null;
    const requestPageSize = typeof req.query.pageSize === 'string'
      ? req.query.pageSize
      : (typeof req.query.limit === 'string' ? req.query.limit : null);
    const requestOffset = typeof req.query.offset === 'string' ? req.query.offset : null;
    const requestSortField = typeof req.query.sortField === 'string' ? req.query.sortField : null;
    const requestSortDir = typeof req.query.sortDir === 'string' ? req.query.sortDir : null;
    const requestSearch = normalizeValue(req.query.search);
    const requestIncludeTotal = req.query.includeTotal === 'true';
    
    // Force cache refresh if explicitly requested
    if (req.query.refreshCache === 'true') {
      if (metricId) {
        await cronManager.refreshMetricCache(metricId, activeQueries);
      } else {
        await cronManager.refreshAllCaches(activeQueries);
      }
    }
    
    // If a specific metric is requested
    if (metricId) {
      metricLog(`Processing request for specific metric: ${metricId}`);
      const metricData = await fetchMetricData(metricId, activeQueries, availableMetrics, useMock, useCached, {
        from: requestFrom,
        to: requestTo,
        filterField: requestFilterField,
        filterValue: requestFilterValue,
        filterField2: requestFilterField2,
        filterValue2: requestFilterValue2,
        filterField3: requestFilterField3,
        filterValue3: requestFilterValue3,
        page: requestPage,
        pageSize: requestPageSize,
        offset: requestOffset,
        sortField: requestSortField,
        sortDir: requestSortDir,
        search: requestSearch,
        includeTotal: requestIncludeTotal
      });
      return res.status(200).json(metricData);
    } 
    
    // If all metrics are requested
    else {
      metricLog('Processing request for all metrics');
      const allMetricsData = await fetchAllMetricsData(activeQueries, availableMetrics, useMock, useCached);
      return res.status(200).json(allMetricsData);
    }
  } catch (error) {
    // Quiet expected/permanent failures — these are surfaced to the UI via
    // structured error codes and rendered as calm empty states, so they
    // don't deserve a scary "API Error" line in the dev console every time
    // an account has no rows in a particular dbt model.
    const expectedCodes = new Set([
      'InvalidMetric',
      'FilterRequired',
      'MissingMetricSource',
      'MetricQueryFailed',
    ]);
    if (expectedCodes.has(error.code)) {
      metricLog(`API expected failure: ${error.code} — ${error.message}`);
    } else {
      console.error('API Error:', error.message);
    }

    return res.status(error.status || 500).json({
      error: error.code || 'ServerError',
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Fetch data for a specific metric
 * @param {string} metricId - Metric identifier
 * @param {boolean} useMock - Whether to use mock data
 * @param {boolean} useCached - Whether to use cached data
 * @returns {Promise<Array>} Array of data points
 */
async function fetchMetricData(metricId, queries, availableMetrics, useMock = false, useCached = true, opts = {}) {
  // Get the query for this metric
  const query = queries[metricId];
  
  if (!query) {
    const error = new Error(`Unknown metric: ${metricId}. Available metrics: ${availableMetrics.join(', ')}`);
    error.status = 400;
    error.code = 'InvalidMetric';
    throw error;
  }

  // Guard: scoped/account-shaped metrics must be called with an explicit
  // filter. Without one, ClickHouse would scan every address in the table.
  // The frontend already always passes filterField/filterValue for these
  // metrics; this guard catches programmer error and external callers.
  if (isScopedFilteredMetric(metricId)) {
    const hasFilter =
      (opts.filterField && opts.filterValue) ||
      (opts.filterField2 && opts.filterValue2) ||
      (opts.filterField3 && opts.filterValue3);
    if (!hasFilter) {
      const error = new Error(
        `Metric ${metricId} is account-scoped and requires a filterField/filterValue parameter.`
      );
      error.status = 400;
      error.code = 'FilterRequired';
      throw error;
    }
  }

  metricLog(`Fetching data for metric: ${metricId}`);
  metricLog(`Query: ${query.substring(0, 100)}...`);

  const {
    from: fromParam,
    to: toParam,
    filterField,
    filterValue,
    filterField2,
    filterValue2,
    filterField3,
    filterValue3,
    page: pageParam,
    pageSize: pageSizeParam,
    offset: offsetParam,
    sortField: sortFieldParam,
    sortDir: sortDirParam,
    search: searchParam,
    includeTotal: includeTotalParam,
  } = opts;

  const isIsoDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
  const isSafeIdentifier = (s) => typeof s === 'string' && /^[A-Za-z_][A-Za-z0-9_]*$/.test(s);
  const escapeSqlString = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "''");
  const isNumericLiteral = (s) => /^-?\d+(?:\.\d+)?$/.test(String(s).trim());
  const clampInteger = (value, fallback, min, max) => {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, parsed));
  };
  const toSqlLiteral = (value) => {
    const normalized = String(value).trim();
    if (isNumericLiteral(normalized)) {
      return normalized;
    }
    return `'${escapeSqlString(normalized)}'`;
  };
  const toLowerSqlLiteral = (value) => `'${escapeSqlString(String(value).trim().toLowerCase())}'`;
  const buildFilterCondition = (fieldName, rawValue) => {
    if (!isSafeIdentifier(fieldName) || typeof rawValue !== 'string' || rawValue.length === 0) {
      return null;
    }

    const values = rawValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (values.length === 0) {
      return null;
    }

    if (values.length === 1) {
      return `${fieldName} = ${toSqlLiteral(values[0])}`;
    }

    return `${fieldName} IN (${values.map(toSqlLiteral).join(', ')})`;
  };
  const buildGraphAddressCondition = (rawValue) => {
    if (typeof rawValue !== 'string' || rawValue.length === 0) return null;
    const values = rawValue
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (values.length === 0) return null;

    if (values.length === 1) {
      return `(lower(source) = ${toLowerSqlLiteral(values[0])} OR lower(target) = ${toLowerSqlLiteral(values[0])})`;
    }

    const list = values.map(toLowerSqlLiteral).join(', ');
    return `(lower(source) IN (${list}) OR lower(target) IN (${list}))`;
  };
  const stripTrailingOrderBy = (sql) => {
    const lower = String(sql || '').toLowerCase();
    const orderByIdx = lower.lastIndexOf('order by');
    return orderByIdx >= 0 ? sql.slice(0, orderByIdx) : sql;
  };
  const buildValidatorMembersOrderBy = ({ sortField, sortDir }) => {
    if (sortField === 'validator_index') {
      return `validator_index ${sortDir}`;
    }
    return `${sortField} ${sortDir}, validator_index ASC`;
  };
  const buildCirclesTrustNetworkRows = async (rawAvatarValue) => {
    const avatarValues = String(rawAvatarValue || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

    if (avatarValues.length === 0) return [];

    const avatarList = avatarValues.map(toSqlLiteral).join(', ');
    const relations = await cronManager.executeClickHouseQuery(`
      SELECT avatar, counterparty, direction
      FROM dbt.api_execution_circles_v2_avatar_trust_relations
      WHERE avatar IN (${avatarList})
      LIMIT 500
    `);

    if (!relations || relations.length === 0) return [];

    const nodeAddresses = new Set();
    relations.forEach((row) => {
      const avatar = String(row?.avatar || '').trim().toLowerCase();
      const counterparty = String(row?.counterparty || '').trim().toLowerCase();
      if (avatar) nodeAddresses.add(avatar);
      if (counterparty) nodeAddresses.add(counterparty);
    });

    const nodeList = Array.from(nodeAddresses).slice(0, 600);
    const metadataRows = nodeList.length > 0
      ? await cronManager.executeClickHouseQuery(`
          SELECT avatar, name, metadata_name, metadata_preview_image_url, metadata_image_url
          FROM dbt.api_execution_circles_v2_avatar_metadata
          WHERE avatar IN (${nodeList.map(toSqlLiteral).join(', ')})
        `)
      : [];

    const metadataByAvatar = new Map(
      (metadataRows || []).map((row) => [String(row.avatar || '').toLowerCase(), row])
    );
    const imageEmittedFor = new Set();
    const relationRank = { mutual: 1, outgoing: 2, incoming: 3 };
    const sortedRelations = [...relations].sort((a, b) => {
      const rankDelta = (relationRank[String(a.direction || '')] || 9) - (relationRank[String(b.direction || '')] || 9);
      if (rankDelta !== 0) return rankDelta;
      return String(a.counterparty || '').localeCompare(String(b.counterparty || ''));
    });

    const nodeName = (address) => {
      const key = String(address || '').toLowerCase();
      const metadata = metadataByAvatar.get(key) || {};
      return metadata.metadata_name || metadata.name || address;
    };
    const nodeImage = (address) => {
      const key = String(address || '').toLowerCase();
      if (!key || imageEmittedFor.has(key)) return null;
      const metadata = metadataByAvatar.get(key) || {};
      const image = metadata.metadata_preview_image_url || metadata.metadata_image_url || null;
      if (image) {
        imageEmittedFor.add(key);
        return image;
      }
      return null;
    };
    const makeEdge = ({ avatar, sourceId, targetId, sourceLayer, targetLayer, direction }) => ({
      avatar,
      source_id: sourceId,
      source_name: nodeName(sourceId),
      source_layer: sourceLayer,
      source_image: nodeImage(sourceId),
      target_id: targetId,
      target_name: nodeName(targetId),
      target_layer: targetLayer,
      target_image: nodeImage(targetId),
      direction,
      value: 1,
    });

    const rows = [];
    sortedRelations.forEach((row) => {
      const avatar = String(row?.avatar || '').trim().toLowerCase();
      const counterparty = String(row?.counterparty || '').trim().toLowerCase();
      const direction = String(row?.direction || '').trim().toLowerCase();
      if (!avatar || !counterparty) return;

      if (direction === 'outgoing' || direction === 'mutual') {
        rows.push(makeEdge({
          avatar,
          sourceId: avatar,
          targetId: counterparty,
          sourceLayer: 'Focal avatar',
          targetLayer: direction === 'mutual' ? 'Mutual' : 'Trust given',
          direction: direction === 'mutual' ? 'Mutual' : 'Trust given',
        }));
      }

      if (direction === 'incoming' || direction === 'mutual') {
        rows.push(makeEdge({
          avatar,
          sourceId: counterparty,
          targetId: avatar,
          sourceLayer: direction === 'mutual' ? 'Mutual' : 'Trust received',
          targetLayer: 'Focal avatar',
          direction: direction === 'mutual' ? 'Mutual' : 'Trust received',
        }));
      }
    });

    return rows;
  };
  const validatorPagination = metricId === VALIDATOR_MEMBERS_METRIC_ID
    ? {
        page: clampInteger(pageParam, 1, 1, 1000000),
        pageSize: clampInteger(pageSizeParam, 25, 1, 500),
        offset: offsetParam != null
          ? clampInteger(offsetParam, 0, 0, 50000000)
          : null,
        sortField: VALIDATOR_MEMBERS_SORT_FIELDS.has(sortFieldParam)
          ? sortFieldParam
          : 'balance_gno',
        sortDir: String(sortDirParam || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC',
        search: typeof searchParam === 'string' ? searchParam.trim().slice(0, 160) : '',
        includeTotal: Boolean(includeTotalParam || metricId === VALIDATOR_MEMBERS_METRIC_ID),
      }
    : null;

  const effectiveFromToProvided = isIsoDate(fromParam) && isIsoDate(toParam);
  const effectiveFilterProvided = isSafeIdentifier(filterField) && typeof filterValue === 'string' && filterValue.length > 0;
  const effectiveFilter2Provided = isSafeIdentifier(filterField2) && typeof filterValue2 === 'string' && filterValue2.length > 0;
  const effectiveFilter3Provided = isSafeIdentifier(filterField3) && typeof filterValue3 === 'string' && filterValue3.length > 0;
  const hasEffectiveFilters = effectiveFilterProvided || effectiveFilter2Provided || effectiveFilter3Provided;

  // Backwards-compatible cache key:
  // - If no extra params are provided, keep the original metricId cache key.
  // - If params are provided, include them so cached results don't mix.
  const cacheKey = (() => {
    if (!effectiveFromToProvided && !effectiveFilterProvided && !effectiveFilter2Provided && !effectiveFilter3Provided && !validatorPagination) return metricId;
    const parts = [metricId];
    if (hasEffectiveFilters) parts.push(`filteredCache=${FILTERED_QUERY_CACHE_VERSION}`);
    if (effectiveFromToProvided) parts.push(`from=${fromParam}`, `to=${toParam}`);
    if (effectiveFilterProvided) parts.push(`filterField=${filterField}`, `filterValue=${cacheValue(filterValue)}`);
    if (effectiveFilter2Provided) parts.push(`filterField2=${filterField2}`, `filterValue2=${cacheValue(filterValue2)}`);
    if (effectiveFilter3Provided) parts.push(`filterField3=${filterField3}`, `filterValue3=${cacheValue(filterValue3)}`);
    if (validatorPagination) {
      parts.push(
        `page=${validatorPagination.page}`,
        `pageSize=${validatorPagination.pageSize}`,
        `offset=${validatorPagination.offset ?? ''}`,
        `sortField=${validatorPagination.sortField}`,
        `sortDir=${validatorPagination.sortDir}`,
        `search=${cacheValue(validatorPagination.search)}`
      );
    }
    return parts.join('|');
  })();
  
  try {
    // First check if we can use cache
    if (useCached) {
      const cachedData = cacheManager.getCache(cacheKey);
      if (cachedData) {
        const cachedLength = Array.isArray(cachedData) ? cachedData.length : cachedData?.data?.length;
        metricLog(`Using cached data for ${cacheKey} (${cachedLength || 0} records)`);
        return cachedData;
      }
    }
    
    // If we need to generate new data
    if (useMock) {
      metricLog(`Generating mock data for ${metricId}`);
      const mockResult = generateMockData(query, metricId);
      
      // Cache the mock data
      cacheManager.setCache(cacheKey, mockResult);
      
      return mockResult;
    }

    if (
      metricId === CIRCLES_TRUST_NETWORK_METRIC_ID &&
      effectiveFilterProvided &&
      filterField === 'avatar'
    ) {
      const graphRows = await buildCirclesTrustNetworkRows(filterValue);
      if (graphRows.length > 0) {
        cacheManager.setCache(cacheKey, graphRows);
      }
      return graphRows;
    }
    
    // Default behavior (backwards-compatible): last 365 days unless overridden by query params
    const toDateObj = new Date();
    const fromDateObj = new Date(toDateObj);
    fromDateObj.setDate(fromDateObj.getDate() - 365); // keep existing behavior
    
    // Format dates for query
    const defaultFromStr = fromDateObj.toISOString().split('T')[0];
    const defaultToStr = toDateObj.toISOString().split('T')[0];
    const fromStr = effectiveFromToProvided ? fromParam : defaultFromStr;
    const toStr = effectiveFromToProvided ? toParam : defaultToStr;
    
    // Process the query with date placeholders
    let processedQuery = query
      .replace(/\{from\}/g, fromStr)
      .replace(/\{to\}/g, toStr);

    // Optionally apply server-side filtering by wrapping the query.
    // The client (MetricGrid) only sends filterField/filterValue for metrics
    // that explicitly declare support via globalFilterField or enableFiltering,
    // so we trust the request and always apply the filter.
    if (hasEffectiveFilters) {
      const conditions = [];
      if (effectiveFilterProvided) {
        const condition = metricId === ACCOUNT_COUNTERPARTY_GRAPH_METRIC_ID && filterField === 'address'
          ? buildGraphAddressCondition(filterValue)
          : buildFilterCondition(filterField, filterValue);
        if (condition) conditions.push(condition);
      }
      if (effectiveFilter2Provided) {
        const condition = buildFilterCondition(filterField2, filterValue2);
        if (condition) conditions.push(condition);
      }
      if (effectiveFilter3Provided) {
        const condition = buildFilterCondition(filterField3, filterValue3);
        if (condition) conditions.push(condition);
      }

      if (conditions.length > 0) {
        if (processedQuery.includes(INLINE_FILTER_MARKER)) {
          processedQuery = processedQuery.replaceAll(
            INLINE_FILTER_MARKER,
            `AND ${conditions.join(' AND ')}`
          );
        } else {
          const lowerQuery = processedQuery.toLowerCase();
          // Preserve ORDER BY (and any trailing LIMIT) by hoisting it to the outer query.
          const orderByIdx = lowerQuery.lastIndexOf('order by');
          const innerQuery = orderByIdx >= 0 ? processedQuery.slice(0, orderByIdx) : processedQuery;
          const orderByClause = orderByIdx >= 0 ? processedQuery.slice(orderByIdx) : '';

          processedQuery = `
            SELECT *
            FROM (
              ${innerQuery}
            )
            WHERE ${conditions.join(' AND ')}
            ${orderByClause}
          `;
        }
      }
    }

    let paginatedResponseMeta = null;
    if (validatorPagination) {
      const baseQuery = stripTrailingOrderBy(processedQuery);
      let scopedQuery = `
        SELECT *
        FROM (
          ${baseQuery}
        )
      `;

      if (validatorPagination.search) {
        const searchLiteral = `'${escapeSqlString(validatorPagination.search)}'`;
        const searchConditions = VALIDATOR_MEMBERS_SEARCH_FIELDS.map((field) =>
          `positionCaseInsensitive(toString(${field}), ${searchLiteral}) > 0`
        );
        scopedQuery = `
          SELECT *
          FROM (
            ${baseQuery}
          )
          WHERE ${searchConditions.join(' OR ')}
        `;
      }

      const offset = validatorPagination.offset ?? ((validatorPagination.page - 1) * validatorPagination.pageSize);
      const countQuery = `SELECT count() AS total FROM (${scopedQuery})`;
      let total = 0;
      try {
        const countRows = await cronManager.executeClickHouseQuery(countQuery);
        total = Number(countRows?.[0]?.total || 0);
      } catch (countError) {
        metricLog(`Count query failed for ${metricId}: ${getSafeErrorMessage(countError)}`);
      }

      processedQuery = `
        SELECT *
        FROM (
          ${scopedQuery}
        )
        ORDER BY ${buildValidatorMembersOrderBy(validatorPagination)}
        LIMIT ${validatorPagination.pageSize}
        OFFSET ${offset}
      `;
      paginatedResponseMeta = {
        page: validatorPagination.page,
        pageSize: validatorPagination.pageSize,
        total,
        lastPage: Math.max(1, Math.ceil(total / validatorPagination.pageSize)),
      };
    }
    
    metricLog(`Executing query for ${metricId}: ${processedQuery.substring(0, 200)}...`);
    
    // Execute the query against ClickHouse
    let rawData;
    let primaryGraphError = null;
    try {
      rawData = await cronManager.executeClickHouseQuery(processedQuery);
    } catch (error) {
      if (
        metricId === ACCOUNT_COUNTERPARTY_GRAPH_METRIC_ID &&
        effectiveFilterProvided &&
        filterField === 'address'
      ) {
        primaryGraphError = error;
        rawData = [];
      } else {
      // Never retry a filtered request without its filter. That turns a single
      // account/profile lookup into a full table scan and can exhaust ClickHouse
      // memory. Surface the failure to the empty-state handling below.
        throw error;
      }
    }

    if (
      metricId === ACCOUNT_COUNTERPARTY_GRAPH_METRIC_ID &&
      effectiveFilterProvided &&
      filterField === 'address' &&
      (!rawData || rawData.length === 0)
    ) {
      const addressValues = String(filterValue || '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
      if (addressValues.length > 0) {
        const addressList = addressValues.map(toLowerSqlLiteral).join(', ');
        const linkedFallbackQuery = `
          SELECT
            lower(root_address) AS source,
            if(
              lower(coalesce(nullIf(entity_address, ''), '')) = lower(root_address),
              concat(coalesce(nullIf(relation, ''), entity_type, 'linked'), ':', entity_id),
              lower(coalesce(nullIf(entity_address, ''), entity_id))
            ) AS target,
            'Selected account' AS source_name,
            coalesce(nullIf(display_label, ''), entity_type, relation, entity_id) AS target_name,
            coalesce(nullIf(relation, ''), entity_type, 'linked') AS edge_type,
            greatest(toFloat64OrZero(toString(value_count)), 1) AS weight,
            value_count AS raw_volume,
            last_seen_at AS last_seen_date
          FROM dbt.api_execution_account_linked_entities_latest
          WHERE lower(root_address) IN (${addressList})
            AND coalesce(nullIf(entity_address, ''), entity_id) != ''
          ORDER BY weight DESC
          LIMIT 60
        `;
        const tokenFallbackQuery = `
          SELECT
            lower(address) AS source,
            concat('token:', coalesce(nullIf(symbol, ''), token_address)) AS target,
            'Selected account' AS source_name,
            coalesce(nullIf(symbol, ''), token_address) AS target_name,
            'token_activity' AS edge_type,
            count() AS weight,
            sum(abs(toFloat64(net_delta_raw))) AS raw_volume,
            max(date) AS last_seen_date
          FROM dbt.int_execution_tokens_address_diffs_daily
          WHERE date BETWEEN toDate('${fromStr}') AND toDate('${toStr}')
            AND lower(address) IN (${addressList})
            AND net_delta_raw IS NOT NULL
            AND toFloat64(net_delta_raw) != 0
          GROUP BY source, target, source_name, target_name, edge_type
          ORDER BY weight DESC
          LIMIT 60
        `;

        try {
          const linkedRows = await cronManager.executeClickHouseQuery(linkedFallbackQuery);
          rawData = linkedRows && linkedRows.length > 0
            ? linkedRows
            : await cronManager.executeClickHouseQuery(tokenFallbackQuery);
        } catch (fallbackError) {
          metricLog(`Graph fallback failed for ${metricId}: ${getSafeErrorMessage(fallbackError)}`);
          if (primaryGraphError) throw primaryGraphError;
        }
      }
    }
    
    metricLog(`Query result for ${metricId}: ${rawData?.length || 0} records`);
    
    // Cache the results
    const responseData = paginatedResponseMeta
      ? { data: rawData || [], ...paginatedResponseMeta }
      : (rawData || []);

    if ((rawData && rawData.length > 0) || paginatedResponseMeta) {
      cacheManager.setCache(cacheKey, responseData);
      
      if (DEBUG_METRICS && rawData.length > 0) {
        console.log(`Sample data for ${metricId}:`, summarizeForLog(rawData.slice(0, 3)));
        const uniqueLabels = [...new Set(rawData.map(item => item.label).filter(Boolean))];
        console.log(`Unique labels in ${metricId}:`, summarizeForLog(uniqueLabels));
      }
    }
    
    // Return the data
    return responseData;
  } catch (error) {
    const errorText = `${error?.message || ''} ${error?.response?.data?.exception || ''} ${error?.response?.data?.message || ''}`;
    const looksLikeMissingTable = /UNKNOWN_TABLE|Unknown table|doesn't exist|does not exist/i.test(errorText);
    const isScopedFilterFailure = hasEffectiveFilters && isScopedFilteredMetric(metricId);
    const suppressErrorLog =
      looksLikeMissingTable ||
      isScopedFilterFailure ||
      String(metricId || '').startsWith('api_execution_account_');

    if (suppressErrorLog) {
      metricLog(`Metric ${metricId} returned no data: ${getSafeErrorMessage(error)}`);
    } else {
      console.error(`Error fetching metric ${metricId}: ${getSafeErrorMessage(error)}`);
    }
    
    // Try to use cache as a fallback

    if (!useCached && !isScopedFilterFailure) {
      const cachedData = cacheManager.getCache(cacheKey);
      if (cachedData) {
        metricLog(`Using cached data as fallback for ${metricId}`);
        return cachedData;
      }
    }
    
    // Scoped account/profile requests must not silently become empty rows. The
    // frontend needs to distinguish "true no data" from ClickHouse errors,
    // missing tables, and memory-limit failures.
    if (looksLikeMissingTable || String(metricId || '').startsWith('api_execution_account_') || isScopedFilterFailure) {
      // Override any axios-provided code (e.g. ERR_BAD_REQUEST) so the
      // frontend can distinguish permanent "no data for this address"
      // states from transient failures.
      error.status = error?.response?.status || error.status || 502;
      error.code = looksLikeMissingTable ? 'MissingMetricSource' : 'MetricQueryFailed';
      throw error;
    }

    // If all else fails, try to generate mock data based on the metricId
    metricLog(`Generating fallback mock data for ${metricId}`);
    return generateMockData(query, metricId);
  }
}

/**
 * Fetch data for all metrics
 * @param {boolean} useMock - Whether to use mock data
 * @param {boolean} useCached - Whether to use cached data
 * @returns {Promise<Object>} Object with metric data
 */
async function fetchAllMetricsData(queries, availableMetrics, useMock = false, useCached = true) {
  // Get all metric IDs
  const metricIds = availableMetrics;
  
  metricLog(`Fetching data for ${metricIds.length} metrics: ${metricIds.join(', ')}`);
  
  // Fetch each metric in parallel
  const promises = metricIds.map(metricId => 
    fetchMetricData(metricId, queries, availableMetrics, useMock, useCached)
      .then(data => ({ [metricId]: data }))
      .catch(error => {
        console.error(`Error fetching ${metricId}:`, error);
        return { [metricId]: [] };
      })
  );
  
  // Combine all results
  const results = await Promise.all(promises);
  const combined = Object.assign({}, ...results);
  
  metricLog(`All metrics fetched. Results:`, Object.keys(combined).map(key => `${key}: ${combined[key]?.length || 0} records`));
  
  return combined;
}

/**
 * Generate mock data for development/testing
 * @param {string} query - The original query
 * @param {string} metricId - Optional metric ID
 * @returns {Array} Mock data points
 */
function generateMockData(query, metricId = null) {
  metricLog(`Generating mock data for ${metricId}`);
  
  // For historical_yield_sdai, generate multi-series data
  if (metricId === 'historical_yield_sdai') {
    const mockDataPoints = [];
    const labels = ['7DMM', '30DMM', 'Daily'];
    const startDate = new Date('2023-10-12');
    const endDate = new Date();
    
    // Generate data for each day
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0] + ' 00:00:00';
      
      labels.forEach(label => {
        mockDataPoints.push({
          date: dateStr,
          label: label,
          apy: Math.random() * 5 + 8 // Random APY between 8-13%
        });
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    metricLog(`Generated ${mockDataPoints.length} mock data points for ${metricId}`);
    return mockDataPoints;
  }
  
  // Extract date range from query
  const fromMatch = query.match(/BETWEEN '(.+?)'/);
  const toMatch = query.match(/AND '(.+?)'/);
  
  const from = fromMatch ? fromMatch[1] : getDefaultFromDate();
  const to = toMatch ? toMatch[1].split(' ')[0] : getTodayDate();
  
  // Detect if query returns a complex multi-series result
  const hasMultipleSeries = query.includes('SUM(if') || query.includes('COUNT(if');
  
  if (hasMultipleSeries) {
    return mockData.generateClientDistributionData(from, to);
  } else {
    // For simple metrics
    return mockData.generateMetricData(metricId || 'unknown', from, to);
  }
}

/**
 * Get the default "from" date (90 days ago)
 * @returns {string} Date in YYYY-MM-DD format
 */
function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().split('T')[0];
}

// Expose internal helpers so sibling endpoints (e.g. account-portfolio-overview)
// can reuse the query loader and per-metric fetch path without round-tripping
// HTTP. These are attached to the handler function so the default Vercel
// invocation (`module.exports(req, res)`) continues to work unchanged.
module.exports.fetchMetricData = fetchMetricData;
module.exports.getActiveQueries = getActiveQueries;

/**
 * Get today's date
 * @returns {string} Date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}
