/**
 * Mock API service that can be dropped in as a replacement
 * Put this file alongside api.js in your services directory
 */
class MockApiService {
    constructor() {
      console.log('MockApiService initialized - using simulated data');
    }
  
    async fetchMetric(metricName, params = {}) {
      console.log(`Mock API: Fetching ${metricName} with params:`, params);
      
      // Generate random data based on metric name
      const dateRange = params.range || '7d';
      const days = parseInt(dateRange.replace('d', ''), 10);
      
      return this._generateMockData(metricName, days);
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
            // Create realistic-looking data with a pattern
            const baseValue = 500 + Math.sin(i * 0.5) * 200;
            value = Math.floor(baseValue + Math.random() * 100);
            break;
          case 'dataSize':
            // Data size with weekly pattern (higher on weekdays)
            const dayOfWeek = date.getDay();
            const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 1;
            value = Math.floor((300000000 + Math.random() * 200000000) * weekdayFactor);
            break;
          case 'queryDuration':
            // Query duration with slight upward trend
            value = 0.2 + (Math.random() * 0.5) + (i / days) * 0.3;
            break;
          case 'errorRate':
            // Error rate with occasional spikes
            const isSpike = Math.random() < 0.1;
            value = isSpike ? Math.random() * 5 : Math.random() * 0.8;
            break;
          default:
            value = Math.random() * 100;
        }
        
        data.push({ date: dateString, value });
      }
      
      return data;
    }
  }
  
  export default new MockApiService();