const metricsHandler = require('./metrics');
const cacheManager = require('./cache');

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

// Five always-on overview lookups. They all key off the same address and used
// to be issued as five separate `/api/metrics/<id>` requests on every portfolio
// open. Coalescing them into one round-trip cuts cold-start cost ~5x.
const OVERVIEW_PARTS = [
  { key: 'profile',          metricId: 'api_execution_account_profile_latest',          filterField: 'address' },
  { key: 'linkedEntities',   metricId: 'api_execution_account_linked_entities_latest',  filterField: 'root_address' },
  { key: 'activitySummary',  metricId: 'api_execution_account_transaction_summary_latest', filterField: 'address' },
  { key: 'roleFlags',        metricId: 'api_execution_account_role_flags_current',      filterField: 'address' },
  { key: 'circlesAvatar',    metricId: 'api_execution_circles_v2_avatar_metadata',      filterField: 'avatar' },
];

const isLocalDevRuntime = (req) => {
  const requestHost = String(req.headers?.host || '');
  const isLocalHostRequest = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(requestHost);
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.VERCEL_DEV === '1' ||
    isLocalHostRequest
  );
};

const cacheKeyFor = (address) => `account-portfolio-overview|v1|${address}`;

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing API key',
    });
  }

  const localDev = isLocalDevRuntime(req);
  if (localDev) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Pragma', 'no-cache');
  }

  try {
    const rawAddress = typeof req.query.address === 'string' ? req.query.address.trim() : '';
    if (!ADDRESS_RE.test(rawAddress)) {
      return res.status(400).json({
        error: 'InvalidAddress',
        message: 'address must be a 0x-prefixed 40-character hex string',
      });
    }
    const address = rawAddress.toLowerCase();
    const useCached = req.query.useCached !== 'false' && !localDev;
    const refreshCache = req.query.refreshCache === 'true';

    const cacheKey = cacheKeyFor(address);
    if (useCached && !refreshCache) {
      const cached = cacheManager.getCache(cacheKey);
      if (cached) {
        return res.status(200).json(cached);
      }
    }

    const { queries: activeQueries, availableMetrics } = metricsHandler.getActiveQueries(localDev);

    const settled = await Promise.allSettled(
      OVERVIEW_PARTS.map((part) =>
        metricsHandler.fetchMetricData(
          part.metricId,
          activeQueries,
          availableMetrics,
          false,
          useCached,
          { filterField: part.filterField, filterValue: address }
        )
      )
    );

    const bundle = {};
    settled.forEach((result, index) => {
      const part = OVERVIEW_PARTS[index];
      if (result.status === 'fulfilled') {
        const value = result.value;
        const rows = Array.isArray(value) ? value : (Array.isArray(value?.data) ? value.data : []);
        bundle[part.key] = rows;
      } else {
        // Permanent / model-missing failures are normal here — the section
        // simply renders an empty state. Surface a per-key error code only.
        bundle[part.key] = [];
        bundle[`${part.key}Error`] = result.reason?.code || 'MetricQueryFailed';
      }
    });

    const responsePayload = { address, ...bundle, fetchedAt: new Date().toISOString() };
    cacheManager.setCache(cacheKey, responsePayload);

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Account portfolio overview error:', error?.message || error);
    return res.status(500).json({
      error: 'ServerError',
      message: error?.message || 'Failed to load account portfolio overview',
    });
  }
};
