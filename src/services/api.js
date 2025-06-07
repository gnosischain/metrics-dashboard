import config from '../utils/config';

/**
 * API service for communicating with the backend
 */
class ApiService {
  constructor() {
    this.baseUrl = config.api.url;
    this.apiKey = config.api.key;
    this.useMockData = config.api.useMockData;
    
    console.log('ApiService initialized:', {
      baseUrl: this.baseUrl,
      useMockData: this.useMockData,
      hasApiKey: !!this.apiKey
    });
  }

  /**
   * Make a GET request to the API
   * @param {string} endpoint - API endpoint (e.g., '/metrics' or '/metric/historical_yield_sdai')
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  async get(endpoint, params = {}) {
    try {
      // For development, use mock data if configured
      if (this.useMockData) {
        console.log(`API: Using mock data for ${endpoint}`);
        return this.getMockData(endpoint, params);
      }

      // Construct the full URL - handle both relative and absolute URLs
      let url;
      if (this.baseUrl.startsWith('http')) {
        // Absolute URL
        url = new URL(endpoint, this.baseUrl);
      } else {
        // Relative URL - construct from current origin
        url = new URL(this.baseUrl + endpoint, window.location.origin);
      }
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log(`API Request: ${url.toString()}`);

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add API key if configured
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response for ${endpoint}:`, data);
      
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      
      // If API fails, try to fall back to mock data
      if (!this.useMockData) {
        console.log(`API failed, falling back to mock data for ${endpoint}`);
        return this.getMockData(endpoint, params);
      }
      
      throw error;
    }
  }

  /**
   * Generate mock data for development
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise} Mock data
   */
  async getMockData(endpoint, params = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

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
        labels.forEach(label => {
          data.push({
            date: dateStr,
            label: label,
            apy: parseFloat((Math.random() * 2 + 3 + (label === '90DMA' ? 0.5 : 0)).toFixed(2))
          });
        });
      } else if (metricId.includes('prices')) {
        // Price data with multiple assets
        const assets = ['bIB01', 'bTSLA', 'bAAPL'];
        assets.forEach(asset => {
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
        return `# Under Construction\n\nThis section is currently being developed.\n\nPlease check back later for updates.`;
      } else {
        // Simple time series data
        data.push({
          date: dateStr,
          value: Math.floor(Math.random() * 1000) + 500
        });
      }
    }
    
    console.log(`Generated mock data for ${metricId}:`, { 
      length: data.length, 
      sample: data.slice(0, 2),
      type: typeof data
    });
    
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
    metrics.forEach(metricId => {
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