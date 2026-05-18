import config from '../utils/config';
import { isDevelopment } from '../utils/env';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const STORAGE_KEY_PREFIX = 'api-cache:v1:';
const responseCache = new Map();
const inFlightRequests = new Map();
const isMetricsEndpoint = (endpoint = '') => endpoint === '/metrics' || endpoint.startsWith('/metrics/');

// No client-side timeout. Some ClickHouse queries legitimately take 30–60s,
// and local vercel-dev has no upstream cap — auto-aborting here turned
// slow-but-valid requests into hard failures. In production, Vercel's
// function maxDuration (60s) bounds the wait; in dev the user can simply
// wait or navigate, and the per-widget AbortController still cancels the
// fetch on unmount.
const REQUEST_TIMEOUT_MS = 0;

// One auto-retry on transient failures (5xx, network errors, timeouts).
// User-initiated aborts and 4xx are never retried.
const TRANSIENT_RETRY_DELAY_MS = 2_000;
const isTransientStatus = (status) => status === 0 || status === 408 || status === 429 || (status >= 500 && status <= 599);

// In production we let the browser/HTTP/2 layer parallelize freely; the
// only place a hard cap helps is local dev where Vite-dev runs in a single
// Node process and a queue of slow widgets thrashes it. Production used to
// fire all requests in parallel and we keep that — a global cap there
// causes head-of-line blocking when a single slow ClickHouse query holds
// a slot for the full 45s timeout.
const METRIC_CONCURRENCY = 6;
const DEV_ONLY_CONCURRENCY = true;
let metricsActive = 0;
const metricsWaiters = [];

const acquireMetricSlot = (signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    reject(makeAbortError(signal.reason));
    return;
  }
  if (metricsActive < METRIC_CONCURRENCY) {
    metricsActive += 1;
    resolve();
    return;
  }
  const waiter = { resolve, reject, signal, onAbort: null };
  if (signal) {
    waiter.onAbort = () => {
      const idx = metricsWaiters.indexOf(waiter);
      if (idx >= 0) metricsWaiters.splice(idx, 1);
      reject(makeAbortError(signal.reason));
    };
    signal.addEventListener('abort', waiter.onAbort, { once: true });
  }
  metricsWaiters.push(waiter);
});

const releaseMetricSlot = () => {
  while (metricsWaiters.length > 0) {
    const next = metricsWaiters.shift();
    if (next.signal && next.onAbort) {
      next.signal.removeEventListener('abort', next.onAbort);
    }
    if (next.signal?.aborted) {
      // Skip already-aborted waiters; they've already rejected.
      continue;
    }
    metricsActive += 1;
    next.resolve();
    return;
  }
  metricsActive = Math.max(0, metricsActive - 1);
};

const enqueueMetricRequest = async (requestFactory, signal) => {
  await acquireMetricSlot(signal);
  try {
    return await requestFactory();
  } finally {
    releaseMetricSlot();
  }
};

const makeAbortError = (reason) => {
  if (reason instanceof Error) return reason;
  const err = new Error(typeof reason === 'string' ? reason : 'Aborted');
  err.name = 'AbortError';
  return err;
};

const isAbortError = (err) => {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  return typeof err === 'object' && err.code === 'ABORT_ERR';
};

const combineSignals = (...signals) => {
  const filtered = signals.filter(Boolean);
  if (filtered.length === 0) return { signal: null, cleanup: () => {} };
  if (filtered.length === 1) return { signal: filtered[0], cleanup: () => {} };
  const controller = new AbortController();
  const onAbort = (event) => {
    controller.abort(event.target.reason);
  };
  filtered.forEach((s) => {
    if (s.aborted) {
      controller.abort(s.reason);
    } else {
      s.addEventListener('abort', onAbort, { once: true });
    }
  });
  return {
    signal: controller.signal,
    cleanup: () => filtered.forEach((s) => s.removeEventListener('abort', onAbort))
  };
};

const raceWithAbort = (promise, signal) => {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(makeAbortError(signal.reason));
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(makeAbortError(signal.reason));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => { signal.removeEventListener('abort', onAbort); resolve(value); },
      (err) => { signal.removeEventListener('abort', onAbort); reject(err); }
    );
  });
};

const delay = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) {
    reject(makeAbortError(signal.reason));
    return;
  }
  const timer = setTimeout(() => {
    if (signal) signal.removeEventListener('abort', onAbort);
    resolve();
  }, ms);
  const onAbort = () => {
    clearTimeout(timer);
    reject(makeAbortError(signal.reason));
  };
  if (signal) signal.addEventListener('abort', onAbort, { once: true });
});

const getSessionStorage = () => {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage || null;
  } catch {
    return null;
  }
};

const readPersistedEntry = (cacheKey) => {
  const storage = getSessionStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY_PREFIX + cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

const writePersistedEntry = (cacheKey, entry) => {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY_PREFIX + cacheKey, JSON.stringify(entry));
  } catch {
    // Quota exceeded or serialization failure — fall back to memory-only cache.
  }
};

const hydrateCacheFromStorage = () => {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    const now = Date.now();
    const staleKeys = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key || !key.startsWith(STORAGE_KEY_PREFIX)) continue;
      const raw = storage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.timestamp !== 'number') {
          staleKeys.push(key);
          continue;
        }
        if (now - parsed.timestamp > CACHE_DURATION_MS) {
          staleKeys.push(key);
          continue;
        }
        responseCache.set(key.slice(STORAGE_KEY_PREFIX.length), parsed);
      } catch {
        staleKeys.push(key);
      }
    }
    staleKeys.forEach((key) => {
      try { storage.removeItem(key); } catch { /* ignore */ }
    });
  } catch {
    // ignore hydration errors
  }
};

const sanitizeParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );

const stableStringify = (value) => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const sortedKeys = Object.keys(value).sort();
  const entries = sortedKeys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(',')}}`;
};

/**
 * API service for communicating with the backend
 */
export class ApiService {
  constructor() {
    this.baseUrl = config.api.url;
    this.apiKey = config.api.key;
    this.useMockData = config.api.useMockData;
    this.isDevelopment = isDevelopment;

    if (!this.isDevelopment) {
      hydrateCacheFromStorage();
    }

    console.log('ApiService initialized:', {
      baseUrl: this.baseUrl,
      useMockData: this.useMockData,
      hasApiKey: !!this.apiKey,
      isDevelopment: this.isDevelopment
    });
  }

  /**
   * Helper to build stable cache keys.
   * @param {string} endpoint
   * @param {Object} params
   * @returns {string}
   */
  getCacheKey(endpoint, params = {}) {
    return `${endpoint}:${stableStringify(sanitizeParams(params))}`;
  }

  /**
   * Read-through GET with in-memory cache + in-flight deduplication.
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>}
   */
  async get(endpoint, params = {}, options = {}) {
    const { signal: callerSignal = null } = options;
    const normalizedParams = sanitizeParams(params);
    const requestParams = { ...normalizedParams };

    if (this.isDevelopment && isMetricsEndpoint(endpoint) && requestParams.useCached === undefined) {
      requestParams.useCached = 'true';
    }

    const bypassFrontendCache = this.isDevelopment;
    const cacheKey = this.getCacheKey(endpoint, requestParams);
    let cachedEntry = bypassFrontendCache ? null : responseCache.get(cacheKey);
    if (!bypassFrontendCache && !cachedEntry) {
      const persisted = readPersistedEntry(cacheKey);
      if (persisted) {
        responseCache.set(cacheKey, persisted);
        cachedEntry = persisted;
      }
    }
    const hasFreshCache = cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS;

    if (!bypassFrontendCache && hasFreshCache) {
      return cachedEntry.data;
    }

    if (callerSignal?.aborted) {
      throw makeAbortError(callerSignal.reason);
    }

    // Inflight dedup is shared across callers, so we don't pass the caller's
    // signal to the existing promise — aborting one caller must not cancel
    // the shared request. The caller-level abort is handled by racing
    // against the abort event below.
    if (inFlightRequests.has(cacheKey)) {
      const inFlight = inFlightRequests.get(cacheKey);
      if (!bypassFrontendCache && cachedEntry) {
        inFlight.catch(() => {});
        return cachedEntry.data;
      }
      return raceWithAbort(inFlight, callerSignal);
    }

    const requestPromise = this.executeWithRetry(endpoint, requestParams, cacheKey, cachedEntry);

    inFlightRequests.set(cacheKey, requestPromise);

    if (!bypassFrontendCache && cachedEntry) {
      requestPromise.catch(() => {});
      return cachedEntry.data;
    }

    return raceWithAbort(requestPromise, callerSignal);
  }

  /**
   * Run the actual fetch with a single transient retry. Per-request timeout
   * is enforced inside fetchFromSource via AbortController; this layer only
   * decides whether to retry on transient failures.
   */
  async executeWithRetry(endpoint, requestParams, cacheKey, cachedEntry) {
    // No automatic retries — 504s here mean the upstream already exhausted
    // its budget and a retry doubles the user's wall time for no gain.
    try {
      const data = await this.fetchWithConcurrency(endpoint, requestParams);

      if (!this.isDevelopment) {
        const entry = { data, timestamp: Date.now() };
        responseCache.set(cacheKey, entry);
        writePersistedEntry(cacheKey, entry);
      }
      return data;
    } catch (error) {
      if (!isAbortError(error)) {
        console.error(`API Error for ${endpoint}:`, error);
      }
      if (cachedEntry) {
        console.warn(`API Error for ${endpoint}, serving stale cached response`);
        return cachedEntry.data;
      }
      throw error;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  fetchWithConcurrency(endpoint, requestParams) {
    // No client-side concurrency gate. The earlier dev-only queue leaked
    // slots (releaseMetricSlot incremented metricsActive when handing off
    // to a waiter without decrementing for the finished task), so after
    // ~6 widget cycles the pool wedged and api.get() hung indefinitely.
    // The browser per-origin connection limit + the in-flight dedup in
    // api.get() already keep total work bounded.
    return this.fetchFromSource(endpoint, requestParams);
  }

  /**
   * Invalidate all cached frontend API responses.
   */
  clearCache() {
    responseCache.clear();
    inFlightRequests.clear();
    const storage = getSessionStorage();
    if (!storage) return;
    try {
      const toRemove = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) toRemove.push(key);
      }
      toRemove.forEach((key) => {
        try { storage.removeItem(key); } catch { /* ignore */ }
      });
    } catch { /* ignore */ }
  }

  /**
   * Invalidate cached entries for endpoint prefix.
   * @param {string} endpointPrefix
   */
  clearCacheByEndpoint(endpointPrefix = '') {
    if (!endpointPrefix) {
      this.clearCache();
      return;
    }

    const prefix = `${endpointPrefix}:`;

    for (const key of responseCache.keys()) {
      if (key.startsWith(prefix)) {
        responseCache.delete(key);
      }
    }

    for (const key of inFlightRequests.keys()) {
      if (key.startsWith(prefix)) {
        inFlightRequests.delete(key);
      }
    }

    const storage = getSessionStorage();
    if (!storage) return;
    try {
      const storagePrefix = STORAGE_KEY_PREFIX + prefix;
      const toRemove = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key && key.startsWith(storagePrefix)) toRemove.push(key);
      }
      toRemove.forEach((key) => {
        try { storage.removeItem(key); } catch { /* ignore */ }
      });
    } catch { /* ignore */ }
  }

  /**
   * Fetch from configured source (mock or real backend).
   * @param {string} endpoint
   * @param {Object} params
   * @returns {Promise<any>}
   */
  async fetchFromSource(endpoint, params = {}) {
    if (this.useMockData) {
      console.log(`API: Using mock data for ${endpoint}`);
      return this.getMockData(endpoint, params);
    }

    let url;
    if (this.baseUrl.startsWith('http')) {
      url = new URL(endpoint, this.baseUrl);
    } else {
      url = new URL(this.baseUrl + endpoint, window.location.origin);
    }

    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    let response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        ...(this.isDevelopment ? { cache: 'no-store' } : {})
      });
    } catch (err) {
      const wrapped = new Error(err?.message || `Network error: ${endpoint}`);
      wrapped.status = 0;
      throw wrapped;
    }

    if (!response.ok) {
      // Try to read the structured error envelope so the UI can distinguish
      // permanent states (MissingMetricSource, InvalidMetric, FilterRequired)
      // from transient ones (timeouts, 5xx). Fall back to status-only text
      // when the body isn't JSON.
      let body = null;
      try {
        body = await response.json();
      } catch {
        // ignore — non-JSON body
      }
      const code = body?.error || body?.code || null;
      const detail = body?.message || response.statusText || '';
      const error = new Error(
        `HTTP ${response.status}${code ? ` (${code})` : ''}${detail ? `: ${detail}` : ''}`
      );
      error.status = response.status;
      error.code = code;
      error.body = body;
      throw error;
    }

    return response.json();
  }

  /**
   * Generate mock data for development
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} Mock data
   */
  async getMockData(endpoint, params = {}) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

    // Extract metric ID from endpoint
    const metricMatch = endpoint.match(/\/metrics\/(.+)/);
    const metricId = metricMatch ? metricMatch[1] : null;

    if (metricId) {
      // Generate mock data for specific metric
      return this.generateMockMetricData(metricId);
    } else if (endpoint === '/metrics') {
      // Generate mock data for all metrics
      return this.generateMockAllMetricsData();
    } else {
      // Default response
      return { message: 'Mock API response', endpoint, params };
    }
  }

  /**
   * Generate mock data for a specific metric
   * @param {string} metricId - Metric ID
   * @returns {Array} Mock data points
   */
  generateMockMetricData(metricId) {
    const data = [];
    const days = 30;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate different types of data based on metric ID
      if (metricId.includes('client_distribution')) {
        // Multi-series data for client distribution
        data.push({
          date: dateStr,
          client: 'Lighthouse',
          value: Math.floor(Math.random() * 100) + 100
        });
        data.push({
          date: dateStr,
          client: 'Teku',
          value: Math.floor(Math.random() * 80) + 50
        });
        data.push({
          date: dateStr,
          client: 'Prysm',
          value: Math.floor(Math.random() * 60) + 30
        });
      } else if (metricId.includes('yield')) {
        // Yield data with labels - generate for each date
        const labels = ['7DMA', '30DMA', '90DMA'];
        labels.forEach((label) => {
          data.push({
            date: dateStr,
            label,
            apy: parseFloat((Math.random() * 2 + 3 + (label === '90DMA' ? 0.5 : 0)).toFixed(2))
          });
        });
      } else if (metricId.includes('gpay_flows_snapshot')) {
        // Directed flow graph mock data with windows and symbols
        const windows = ['1D', '7D', '30D'];
        const symbols = ['USDC', 'DAI', 'EURe'];
        const labels = ['Merchant', 'Card', 'Settlement', 'Rewards'];

        windows.forEach((windowValue, windowIndex) => {
          symbols.forEach((symbol, symbolIndex) => {
            const from = labels[(windowIndex + symbolIndex) % labels.length];
            const to = labels[(windowIndex + symbolIndex + 1) % labels.length];
            const amountUsd = Math.round((windowIndex + 1) * (symbolIndex + 1) * 2500 + Math.random() * 900);
            const tfCnt = Math.max(1, Math.round(amountUsd / 350 + Math.random() * 6));

            data.push({
              window: windowValue,
              symbol,
              from_label: from,
              to_label: to,
              amount_usd: amountUsd,
              tf_cnt: tfCnt
            });
          });
        });
      } else if (metricId.includes('prices')) {
        // Price data with multiple assets
        const assets = ['bIB01', 'bTSLA', 'bAAPL'];
        assets.forEach((asset) => {
          data.push({
            date: dateStr,
            bticker: asset,
            price: parseFloat((Math.random() * 50 + 100).toFixed(2))
          });
        });
      } else if (metricId.includes('nodes') || metricId.includes('countries')) {
        // Single number for number widgets
        return Math.floor(Math.random() * 1000) + 500;
      } else if (metricId === 'under_construction') {
        // Text content
        return '# Under Construction\n\nThis section is currently being developed.\n\nPlease check back later for updates.';
      } else {
        // Simple time series data
        data.push({
          date: dateStr,
          value: Math.floor(Math.random() * 1000) + 500
        });
      }
    }

    return data;
  }

  /**
   * Generate mock data for all metrics
   * @returns {Object} Object with all metric data
   */
  generateMockAllMetricsData() {
    const metrics = [
      'historical_yield_sdai',
      'historical_rwa_prices',
      'historical_active_validators',
      'last_day_nodes',
      'last_day_countries'
    ];

    const allData = {};
    metrics.forEach((metricId) => {
      allData[metricId] = this.generateMockMetricData(metricId);
    });

    return allData;
  }

  /**
   * Fetch data for a specific metric
   * @param {string} metricId - ID of the metric
   * @param {Object} params - Query parameters (from, to, etc.)
   * @returns {Promise} Metric data
   */
  async fetchMetric(metricId, params = {}) {
    return this.get(`/metric/${metricId}`, params);
  }

  /**
   * Fetch data for all metrics
   * @param {Object} params - Query parameters
   * @returns {Promise} All metrics data
   */
  async fetchAllMetrics(params = {}) {
    return this.get('/metrics', params);
  }

  /**
   * Test API connection
   * @returns {Promise} Test response
   */
  async test() {
    return this.get('/test');
  }

  /**
   * Get API status and configuration
   * @returns {Promise} Status response
   */
  async getStatus() {
    return this.get('/status');
  }
}

const apiService = new ApiService();
export default apiService;
