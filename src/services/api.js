import axios from 'axios';
import config from '../utils/config';

/**
 * API service for fetching metrics data
 */
class ApiService {
  constructor() {
    this.baseUrl = config.api.url;
    this.apiKey = config.api.key;
    
    console.log('API Service initialized with URL:', this.baseUrl ? this.baseUrl : '[NOT SET]');
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      }
    });
  }

  /**
   * Fetch metrics data from the API
   * @param {string} metricId - ID of the metric to fetch
   * @param {Object} params - Query parameters
   * @returns {Promise} Metrics data
   */
  async fetchMetric(metricId, params = {}) {
    try {
      console.log(`Fetching ${metricId} from ${this.baseUrl}/metrics`);
      
      // Add useMock=true for development if configured
      if (process.env.NODE_ENV === 'development' && config.api.useMockData === 'true') {
        params.useMock = 'true';
      }
      
      // Add metricId to the params instead of the URL to ensure consistency
      params.metricId = metricId;
      
      const response = await this.client.get(`/metrics`, { params });
      
      // Check if response is in the correct format
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn(`Unexpected response format for ${metricId}:`, response.data);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching metric ${metricId}:`, error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Fetch all metrics data
   * @param {Object} params - Query parameters (date range, etc.)
   * @returns {Promise} All metrics data
   */
  async fetchAllMetrics(params = {}) {
    try {
      console.log('Fetching all metrics');
      
      // Add useMock=true for development if configured
      if (process.env.NODE_ENV === 'development' && config.api.useMockData === 'true') {
        params.useMock = 'true';
      }
      
      const response = await this.client.get('/metrics', { params });
      
      // Return the data as-is
      return response.data || {};
    } catch (error) {
      console.error('Error fetching all metrics:', error);
      return {}; // Return empty object instead of throwing
    }
  }
}

export default new ApiService();