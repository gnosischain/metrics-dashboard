import axios from 'axios';
import config from '../utils/config';

/**
 * API service for fetching metrics data
 * This service uses a proxy API to avoid exposing ClickHouse credentials in the frontend
 */
class ApiService {
  constructor() {
    this.baseUrl = config.api.url;
    this.apiKey = config.api.key;
    
    console.log('API Service initialized with URL:', this.baseUrl ? '[SET]' : '[NOT SET]');
    
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
      console.log(`Fetching ${metricId} from ${this.baseUrl}/metrics/${metricId}`);
      const response = await this.client.get(`/metrics/${metricId}`, { params });
      
      // Check if the response is an object with all metrics or just the array for the requested metric
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // If we got back an object with all metrics, extract just the one we want
        if (response.data[metricId] && Array.isArray(response.data[metricId])) {
          console.log(`Extracted ${metricId} data from full response`);
          return response.data[metricId];
        } else {
          console.error(`Metric ${metricId} not found in response:`, response.data);
          return []; // Return empty array as fallback
        }
      }
      
      // If the response is already an array, use it directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // If the response is invalid, return an empty array
      console.error(`Invalid response format for ${metricId}:`, response.data);
      return [];
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
      const response = await this.client.get('/metrics', { params });
      
      // Ensure we have an object with metric data
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error('Invalid response format for all metrics:', response.data);
        return {}; // Return empty object as fallback
      }
    } catch (error) {
      console.error('Error fetching all metrics:', error);
      return {}; // Return empty object instead of throwing
    }
  }
}

// For local development without an API, we can use mock data
const useMockData = process.env.NODE_ENV === 'development' && !config.api.url;

/**
 * Mock API service for local development
 */
class MockApiService {
  constructor() {
    console.log('Mock API Service initialized');
  }
  
  async fetchMetric(metricId, params = {}) {
    console.log(`Mock API: Fetching ${metricId} with params:`, params);
    
    // Generate random data based on metric name
    const dateRange = params.range || '7d';
    const days = parseInt(dateRange.replace('d', ''), 10);
    
    return this._generateMockData(metricId, days);
  }

  async fetchAllMetrics(params = {}) {
    console.log('Mock API: Fetching all metrics with params:', params);
    
    const dateRange = params.range || '7d';
    const days = parseInt(dateRange.replace('d', ''), 10);
    
    return {
      queryCount: this._generateMockData('queryCount', days),
      dataSize: this._generateMockData('dataSize', days),
      queryDuration: this._generateMockData('queryDuration', days),
      errorRate: this._generateMockData('errorRate', days)
    };
  }

  _generateMockData(metricName, days) {
    const data = [];
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      let value;
      switch (metricName) {
        case 'queryCount':
          value = Math.floor(Math.random() * 1000) + 500;
          break;
        case 'dataSize':
          value = Math.floor(Math.random() * 1000000000) + 100000000; // Bytes
          break;
        case 'queryDuration':
          value = Math.random() * 2 + 0.1; // Seconds
          break;
        case 'errorRate':
          value = Math.random() * 2; // Percentage
          break;
        default:
          value = Math.random() * 100;
      }
      
      data.push({ date: dateString, value });
    }
    
    return data;
  }
}

// Choose which service to use
// During troubleshooting, you can force mock data:
// export default new MockApiService();

// For normal operation with conditional mock/real data:
export default useMockData ? new MockApiService() : new ApiService();