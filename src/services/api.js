import config from '../utils/config';
import { isDevelopment } from '../utils/env';

const CACHE_DURATION_MS = 5 * 60 * 1000;
const responseCache = new Map();
const inFlightRequests = new Map();
const isMetricsEndpoint = (endpoint = '') => endpoint === '/metrics' || endpoint.startsWith('/metrics/');

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
  async get(endpoint, params = {}) {
    const normalizedParams = sanitizeParams(params);
    const requestParams = { ...normalizedParams };

    if (this.isDevelopment && isMetricsEndpoint(endpoint) && requestParams.useCached === undefined) {
      requestParams.useCached = 'false';
    }

    const bypassFrontendCache = this.isDevelopment;
    const cacheKey = this.getCacheKey(endpoint, requestParams);
    const cachedEntry = bypassFrontendCache ? null : responseCache.get(cacheKey);
    const hasFreshCache = cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS;

    if (!bypassFrontendCache && hasFreshCache) {
      return cachedEntry.data;
    }

    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const data = await this.fetchFromSource(endpoint, requestParams);
        if (!bypassFrontendCache) {
          responseCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        }
        return data;
      } catch (error) {
        console.error(`API Error for ${endpoint}:`, error);

        if (cachedEntry) {
          console.warn(`API Error for ${endpoint}, serving stale cached response`);
          return cachedEntry.data;
        }

        if (!this.useMockData) {
          console.log(`API failed, falling back to mock data for ${endpoint}`);
          const mockData = await this.getMockData(endpoint, requestParams);
          if (!bypassFrontendCache) {
            responseCache.set(cacheKey, {
              data: mockData,
              timestamp: Date.now()
            });
          }
          return mockData;
        }

        throw error;
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Invalidate all cached frontend API responses.
   */
  clearCache() {
    responseCache.clear();
    inFlightRequests.clear();
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      ...(this.isDevelopment ? { cache: 'no-store' } : {})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
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
