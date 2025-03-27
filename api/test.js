// Simple test API endpoint to verify dependency loading
const axios = require('axios');

module.exports = (req, res) => {
  try {
    res.status(200).json({
      message: 'API is working',
      axiosVersion: axios.VERSION || 'unknown',
      environment: process.env.NODE_ENV,
      mockDataEnabled: process.env.USE_MOCK_DATA === 'true'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
};