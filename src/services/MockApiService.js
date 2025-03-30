/**
 * Mock API service that can be used for local development
 * This can replace the real API service when working without a backend
 */
class MockApiService {
  constructor() {
    console.log('MockApiService initialized - using simulated data');
  }

  /**
   * Fetch a specific metric
   * @param {string} metricId - ID of the metric to fetch
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Metric data
   */
  async fetchMetric(metricId, params = {}) {
    console.log(`Mock API: Fetching ${metricId} with params:`, params);
    
    // Generate data based on metric ID
    return this.generateMetricData(metricId, params);
  }

  /**
   * Fetch all metrics
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} All metrics data
   */
  async fetchAllMetrics(params = {}) {
    console.log('Mock API: Fetching all metrics with params:', params);
    
    // Create response with all metrics
    return {
      queryCount: await this.generateMetricData('queryCount', params),
      dataSize: await this.generateMetricData('dataSize', params),
      queryDuration: await this.generateMetricData('queryDuration', params),
      errorRate: await this.generateMetricData('errorRate', params)
    };
  }

  /**
   * Generate data for any metric
   * @param {string} metricId - Metric ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Generated data
   */
  async generateMetricData(metricId, params = {}) {
    const { from, to } = this.getDateRange(params);
    
    if (metricId === 'dataSize') {
      return this.generateClientDistributionData(from, to);
    } else {
      return this.generateStandardMetricData(metricId, from, to);
    }
  }

  /**
   * Generate client distribution data for the dataSize metric
   * @param {Date} from - Start date
   * @param {Date} to - End date
   * @returns {Array} Generated client distribution data
   */
  generateClientDistributionData(from, to) {
    const data = [];
    const currentDate = new Date(from);
    const toDate = new Date(to);
    
    while (currentDate <= toDate) {
      for (let hour = 0; hour < 24; hour += 4) {
        // Format as "YYYY-MM-DD HH:00:00"
        const hourStr = `${currentDate.toISOString().split('T')[0]} ${String(hour).padStart(2, '0')}:00:00`;
        
        // Generate values with some trends
        const timeOfDay = hour;
        const dayMultiplier = timeOfDay >= 8 && timeOfDay <= 16 ? 1.5 : 1; // Higher during work hours
        
        data.push({
          hour: hourStr,
          Lighthouse: Math.floor((Math.random() * 50 + 250) * dayMultiplier),
          Teku: Math.floor((Math.random() * 30 + 180) * dayMultiplier),
          Lodestar: Math.floor((Math.random() * 20 + 120) * dayMultiplier),
          Nimbus: Math.floor((Math.random() * 15 + 95) * dayMultiplier),
          Erigon: Math.floor((Math.random() * 10 + 45) * dayMultiplier),
          Unknown: Math.floor((Math.random() * 5 + 20) * dayMultiplier)
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }

  /**
   * Generate standard metric data
   * @param {string} metricId - Metric ID
   * @param {Date} from - Start date
   * @param {Date} to - End date
   * @returns {Array} Generated standard metric data
   */
  generateStandardMetricData(metricId, from, to) {
    const data = [];
    const currentDate = new Date(from);
    const toDate = new Date(to);
    
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      let value;
      switch (metricId) {
        case 'queryCount':
          value = Math.floor(Math.random() * 100000) + 100000;
          break;
        case 'queryDuration':
          value = (Math.random() * 0.2 + 0.8).toFixed(3);
          break;
        case 'errorRate':
          value = (Math.random() * 0.5 + 0.1).toFixed(2);
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }
      
      data.push({ date: dateStr, value });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }

  /**
   * Calculate date range from parameters
   * @param {Object} params - Query parameters
   * @returns {Object} From and to dates
   */
  getDateRange(params) {
    const to = params.to ? new Date(params.to) : new Date();
    let from;
    
    if (params.from) {
      from = new Date(params.from);
    } else if (params.range) {
      from = new Date(to);
      const days = parseInt(params.range.replace('d', ''), 10);
      from.setDate(from.getDate() - days);
    } else {
      from = new Date(to);
      from.setDate(from.getDate() - 7); // Default 7 days
    }
    
    return { from, to };
  }
}

export default new MockApiService();