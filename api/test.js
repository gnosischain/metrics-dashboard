const cacheManager = require('./cache');
const cronManager = require('./cron');

/**
 * API test endpoint to check caching system status
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
    // Get all cached metrics
    const cachedMetrics = cacheManager.getAllCachedMetrics();
    
    // Get last refresh time
    let lastRefreshTime = null;
    try {
      if (!cronManager.useMemoryOnly && cronManager.timestampFile && require('fs').existsSync(cronManager.timestampFile)) {
        const timestamp = parseInt(require('fs').readFileSync(cronManager.timestampFile, 'utf8'));
        lastRefreshTime = new Date(timestamp).toISOString();
      } else if (cronManager.lastRefreshTimestamp) {
        lastRefreshTime = new Date(cronManager.lastRefreshTimestamp).toISOString();
      }
    } catch (error) {
      console.error('Error getting last refresh time:', error);
    }
    
    // Build cache status for each metric
    const cacheStatus = {};
    for (const metricId of cachedMetrics) {
      const lastUpdated = cacheManager.getLastUpdated(metricId);
      cacheStatus[metricId] = {
        cached: true,
        lastUpdated: lastUpdated ? lastUpdated.toISOString() : null
      };
    }
    
    // Check if refresh is needed
    const needsRefresh = cronManager.needsRefresh();
    
    // Return system status
    return res.status(200).json({
      status: 'OK',
      environment: process.env.NODE_ENV || 'development',
      cache: {
        metrics: cachedMetrics,
        status: cacheStatus,
        lastRefresh: lastRefreshTime,
        needsRefresh: needsRefresh,
        refreshInterval: `${cronManager.refreshInterval / (60 * 60 * 1000)} hours`,
        cacheTtl: `${cacheManager.cacheTtl / (60 * 60 * 1000)} hours`,
        usingMemoryCache: cacheManager.useMemoryCache || false,
        usingMemoryTimestamp: cronManager.useMemoryOnly || false,
        cacheDirPath: cacheManager.cacheDir
      },
      configuration: {
        useMockData: process.env.USE_MOCK_DATA === 'true',
        clickhouseConfigured: !!process.env.CLICKHOUSE_HOST,
        dbtSchema: cronManager.getDbtSchema()
      }
    });
  } catch (error) {
    console.error('API Test Error:', error);
    
    return res.status(500).json({
      error: 'ServerError',
      message: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
