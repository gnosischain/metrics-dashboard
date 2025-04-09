/**
 * API handler for single-value metrics
 * This handler processes metrics that return a single value instead of a time series
 */
module.exports = async (req, res) => {
    // Handle preflight OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Verify API key for authentication
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid or missing API key' 
      });
    }
    
    try {
      // Get metric ID from query parameters
      const { metricId } = req.query;
      const useMock = req.query.useMock === 'true' || process.env.USE_MOCK_DATA === 'true';
      
      if (!metricId) {
        return res.status(400).json({
          error: 'BadRequest',
          message: 'Missing metric ID'
        });
      }
      
      // Execute the metric's query (or use mock data)
      let result;
      if (useMock) {
        // Generate mock data based on metric ID
        result = generateMockData(metricId);
      } else {
        // Execute the actual query
        result = await executeQuery(metricId);
      }
      
      return res.status(200).json({ value: result });
    } catch (error) {
      console.error('API Error:', error.message);
      
      return res.status(error.status || 500).json({ 
        error: error.code || 'ServerError', 
        message: error.message || 'Internal server error'
      });
    }
  };
  
  /**
   * Generate mock data for a single-value metric
   * @param {string} metricId - ID of the metric
   * @returns {number} Mock data value
   */
  function generateMockData(metricId) {
    // Generate different ranges of random values based on metric ID
    if (metricId === 'network_peers') {
      return Math.floor(Math.random() * 5000) + 10000; // 10,000 to 15,000
    } else if (metricId.includes('count')) {
      return Math.floor(Math.random() * 1000) + 500; // 500 to 1,500
    } else if (metricId.includes('rate')) {
      return (Math.random() * 5 + 95).toFixed(2); // 95% to 100%
    } else {
      return Math.floor(Math.random() * 100) + 50; // 50 to 150
    }
  }
  
  /**
   * Execute a ClickHouse query for a single-value metric
   * @param {string} metricId - ID of the metric
   * @returns {Promise<number>} Query result
   */
  async function executeQuery(metricId) {
    // This would be implemented with actual ClickHouse query execution
    // For now, returning mock data as a placeholder
    return generateMockData(metricId);
  }