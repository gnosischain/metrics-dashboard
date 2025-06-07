const fs = require('fs');
const path = require('path');
const cacheManager = require('./cache');
const cronManager = require('./cron');

/**
 * Load all query configurations from the queries directory
 * @returns {Object} Object with metric IDs as keys and query strings as values
 */
function loadQueries() {
  const queriesDir = path.join(__dirname, 'queries');
  
  if (!fs.existsSync(queriesDir)) {
    console.warn('Queries directory not found, using empty queries object');
    return {};
  }
  
  const queries = {};
  
  try {
    const files = fs.readdirSync(queriesDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(queriesDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const queryData = JSON.parse(fileContent);
        
        // Use filename (without .json) as the metric ID
        const metricId = path.basename(file, '.json');
        queries[metricId] = queryData.query || queryData;
        
        console.log(`Loaded query for metric: ${metricId}`);
      }
    }
  } catch (error) {
    console.error('Error loading queries:', error);
  }
  
  return queries;
}

/**
 * Generate mock data for development/testing
 * @param {string} metricId - Metric identifier
 * @returns {Array} Mock data array
 */
function generateMockData(metricId) {
  const data = [];
  const days = 30;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate different types of mock data based on metric ID patterns
    if (metricId.includes('client_distribution')) {
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
    } else if (metricId.includes('yield')) {
      data.push({
        date: dateStr,
        label: '7DMA',
        apy: parseFloat((Math.random() * 2 + 3).toFixed(2))
      });
    } else if (metricId.includes('price')) {
      data.push({
        date: dateStr,
        bticker: 'bIB01',
        price: parseFloat((Math.random() * 50 + 100).toFixed(2))
      });
    } else {
      // Default time series data
      data.push({
        date: dateStr,
        value: Math.floor(Math.random() * 1000) + 500
      });
    }
  }
  
  return data;
}

// Load all queries at startup
const allQueries = loadQueries();
const availableMetrics = Object.keys(allQueries);

console.log(`Loaded ${availableMetrics.length} metric queries: ${availableMetrics.join(', ')}`);

// Check and refresh cache if needed (runs on server start)
(async () => {
  try {
    await cronManager.checkAndRefreshIfNeeded(allQueries);
  } catch (error) {
    console.error('Error checking/refreshing cache:', error);
  }
})();

/**
 * Vercel API handler for metrics
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
    // Parse metric ID from URL path or query parameters
    let metricId = req.query.metricId; // For /api/metrics?metricId=xxx requests
    
    // For /api/metric/xxx or /api/metrics/xxx requests, extract from URL
    if (!metricId && req.url) {
      const urlMatch = req.url.match(/\/api\/metrics?\/([^?&]+)/);
      if (urlMatch) {
        metricId = urlMatch[1];
      }
    }
    
    const useMock = req.query.useMock === 'true' || process.env.USE_MOCK_DATA === 'true';
    const useCached = req.query.useCached !== 'false'; // Default to using cache
    
    // Force cache refresh if explicitly requested
    if (req.query.refreshCache === 'true') {
      if (metricId) {
        await cronManager.refreshMetricCache(metricId, allQueries);
      } else {
        await cronManager.refreshAllCaches(allQueries);
      }
    }
    
    // If a specific metric is requested
    if (metricId) {
      console.log(`Processing request for specific metric: ${metricId}`);
      const metricData = await fetchMetricData(metricId, useMock, useCached);
      return res.status(200).json(metricData);
    } 
    
    // If all metrics are requested
    else {
      console.log('Processing request for all metrics');
      const allMetricsData = await fetchAllMetricsData(useMock, useCached);
      return res.status(200).json(allMetricsData);
    }
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Return appropriate error response
    return res.status(error.status || 500).json({ 
      error: error.code || 'ServerError', 
      message: error.message || 'Internal server error'
    });
  }
};

/**
 * Fetch data for a specific metric
 * @param {string} metricId - Metric identifier
 * @param {boolean} useMock - Whether to use mock data
 * @param {boolean} useCached - Whether to use cached data
 * @returns {Promise<Array>} Array of data points
 */
async function fetchMetricData(metricId, useMock = false, useCached = true) {
  // Get the query for this metric
  const query = allQueries[metricId];
  
  if (!query) {
    const error = new Error(`Unknown metric: ${metricId}`);
    error.status = 400;
    error.code = 'InvalidMetric';
    throw error;
  }
  
  try {
    // First check if we can use cache
    if (useCached) {
      const cachedData = cacheManager.getCache(metricId);
      if (cachedData) {
        console.log(`Using cached data for ${metricId}`);
        return cachedData;
      }
    }
    
    // If we need to generate new data
    if (useMock) {
      console.log(`Generating mock data for ${metricId}`);
      const mockData = generateMockData(metricId);
      
      // Cache the mock data
      cacheManager.setCache(metricId, mockData);
      
      return mockData;
    }
    
    // Default to last 90 days
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 90);
    
    // Format dates for query
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];
    
    // Process the query with date placeholders
    const processedQuery = query
      .replace(/\{from\}/g, fromStr)
      .replace(/\{to\}/g, toStr);
    
    // Execute the query against ClickHouse
    // TODO: Implement actual ClickHouse execution here
    console.log(`Would execute ClickHouse query for ${metricId}:`, processedQuery);
    
    // For now, fall back to mock data
    const mockData = generateMockData(metricId);
    
    // Cache the result
    cacheManager.setCache(metricId, mockData);
    
    return mockData;
  } catch (error) {
    console.error(`Error fetching data for ${metricId}:`, error);
    throw error;
  }
}

/**
 * Fetch data for all metrics
 * @param {boolean} useMock - Whether to use mock data
 * @param {boolean} useCached - Whether to use cached data
 * @returns {Promise<Object>} Object with metric IDs as keys and data arrays as values
 */
async function fetchAllMetricsData(useMock = false, useCached = true) {
  const results = {};
  
  try {
    // Fetch data for each available metric
    for (const metricId of availableMetrics) {
      try {
        results[metricId] = await fetchMetricData(metricId, useMock, useCached);
      } catch (error) {
        console.error(`Error fetching data for metric ${metricId}:`, error);
        // Continue with other metrics even if one fails
        results[metricId] = [];
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error fetching all metrics data:', error);
    throw error;
  }
}