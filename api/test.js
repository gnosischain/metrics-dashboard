// Simple test API endpoint to verify dependency loading and API functionality
const axios = require('axios');
const mockData = require('./mock');

module.exports = (req, res) => {
  try {
    // Generate some sample data to demonstrate API functionality
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    const from = oneWeekAgo.toISOString().split('T')[0];
    const to = now.toISOString().split('T')[0];
    
    // Sample data for each metric type
    const sampleData = {
      queryCount: mockData.generateMetricData('queryCount', from, to).slice(0, 3),
      queryDuration: mockData.generateMetricData('queryDuration', from, to).slice(0, 3),
      errorRate: mockData.generateMetricData('errorRate', from, to).slice(0, 3),
      dataSize: mockData.generateClientDistributionData(from, to).slice(0, 3)
    };
    
    res.status(200).json({
      status: 'API is working',
      axiosVersion: axios.VERSION || 'unknown',
      environment: process.env.NODE_ENV,
      mockDataEnabled: process.env.USE_MOCK_DATA === 'true',
      sampleData: sampleData
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};