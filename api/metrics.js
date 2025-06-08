const fs = require('fs');
const path = require('path');
const mockData = require('./mock');
const cacheManager = require('./cache');
const cronManager = require('./cron');

/**
 * Load all query definitions from JSON files
 * @returns {Object} Object with metric IDs as keys and query strings as values
 */
function loadQueries() {
  const queriesDir = path.join(__dirname, 'queries');
  const queries = {};
  
  // If the queries directory doesn't exist, return default queries
  if (!fs.existsSync(queriesDir)) {
    return getDefaultQueries();
  }
  
  // Read all JSON files in the queries directory
  try {
    const files = fs.readdirSync(queriesDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const queryPath = path.join(queriesDir, file);
        const queryContent = fs.readFileSync(queryPath, 'utf8');
        
        try {
          const queryDef = JSON.parse(queryContent);
          
          if (queryDef.id && queryDef.query) {
            queries[queryDef.id] = queryDef.query;
          }
        } catch (parseError) {
          console.error(`Error parsing JSON in ${file}:`, parseError);
        }
      }
    }
    
    // If no queries were loaded, return default queries
    if (Object.keys(queries).length === 0) {
      return getDefaultQueries();
    }
    
    return queries;
  } catch (error) {
    console.error('Error loading queries:', error);
    return getDefaultQueries();
  }
}

/**
 * Get default queries if no custom queries are found
 * @returns {Object} Object with metric IDs as keys and query strings as values
 */
function getDefaultQueries() {
  return {
    // Add the historical_yield_sdai query here as a fallback
    historical_yield_sdai: `
      SELECT 
        date, 
        apy, 
        label 
      FROM dbt.yields_sdai_apy_daily 
      WHERE date >= '{from}' 
      ORDER BY date ASC, label ASC
    `,
    
    // Number of queries executed
    queryCount: `
      SELECT 
        toDate(event_time) AS date, 
        count() AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'QueryStart'
      GROUP BY date
      ORDER BY date
    `,
    
    // Amount of data processed - Complex multi-column query
    dataSize: `
      SELECT 
        toStartOfHour(t2.created_at) AS hour
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='Lighthouse',1,0)) AS Lighthouse
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='teku',1,0)) AS Teku
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='lodestar',1,0)) AS Lodestar
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='nimbus',1,0)) AS Nimbus
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='erigon',1,0)) AS Erigon
        ,SUM(if(splitByChar('/', t1.agent_version)[1] ='',1,0)) AS Unknown
      FROM    
        nebula.visits t1
      INNER JOIN
        nebula.crawls t2
        ON t2.id = t1.crawl_id
      WHERE
        peer_properties.next_fork_version LIKE '%064'
        AND t2.created_at BETWEEN '{from}' AND '{to} 23:59:59'
      GROUP BY 1
      ORDER BY 1
    `,
    
    // Average query duration
    queryDuration: `
      SELECT 
        toDate(event_time) AS date, 
        avg(query_duration_ms) / 1000 AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'QueryFinish'
      GROUP BY date
      ORDER BY date
    `,
    
    // Error rate percentage
    errorRate: `
      SELECT 
        toDate(event_time) AS date, 
        countIf(exception != '') * 100 / count() AS value
      FROM system.query_log
      WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
        AND type = 'ExceptionWhileProcessing'
      GROUP BY date
      ORDER BY date
    `
  };
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
    
    // FIXED: Better URL parsing for /api/metric/xxx or /api/metrics/xxx requests
    if (!metricId && req.url) {
      const urlMatch = req.url.match(/\/api\/metrics?\/([^?&]+)/);
      if (urlMatch) {
        metricId = decodeURIComponent(urlMatch[1]);
        console.log(`Extracted metric ID from URL: ${metricId}`);
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
    const error = new Error(`Unknown metric: ${metricId}. Available metrics: ${availableMetrics.join(', ')}`);
    error.status = 400;
    error.code = 'InvalidMetric';
    throw error;
  }
  
  console.log(`Fetching data for metric: ${metricId}`);
  console.log(`Query: ${query.substring(0, 100)}...`);
  
  try {
    // First check if we can use cache
    if (useCached) {
      const cachedData = cacheManager.getCache(metricId);
      if (cachedData) {
        console.log(`Using cached data for ${metricId} (${cachedData.length} records)`);
        return cachedData;
      }
    }
    
    // If we need to generate new data
    if (useMock) {
      console.log(`Generating mock data for ${metricId}`);
      const mockResult = generateMockData(query, metricId);
      
      // Cache the mock data
      cacheManager.setCache(metricId, mockResult);
      
      return mockResult;
    }
    
    // Default to last 90 days for real data
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 365); // Use 1 year to get more data
    
    // Format dates for query
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];
    
    // Process the query with date placeholders
    const processedQuery = query
      .replace(/\{from\}/g, fromStr)
      .replace(/\{to\}/g, toStr);
    
    console.log(`Executing query for ${metricId}: ${processedQuery.substring(0, 200)}...`);
    
    // Execute the query against ClickHouse
    const rawData = await cronManager.executeClickHouseQuery(processedQuery);
    
    console.log(`Query result for ${metricId}: ${rawData?.length || 0} records`);
    
    // Cache the results
    if (rawData && rawData.length > 0) {
      cacheManager.setCache(metricId, rawData);
      
      // Log some sample data for debugging
      console.log(`Sample data for ${metricId}:`, rawData.slice(0, 3));
      if (rawData.length > 0) {
        const uniqueLabels = [...new Set(rawData.map(item => item.label).filter(Boolean))];
        console.log(`Unique labels in ${metricId}:`, uniqueLabels);
      }
    }
    
    // Return the data
    return rawData || [];
  } catch (error) {
    console.error(`Error fetching metric ${metricId}:`, error);
    
    // Try to use cache as a fallback
    if (!useCached) {
      const cachedData = cacheManager.getCache(metricId);
      if (cachedData) {
        console.log(`Using cached data as fallback for ${metricId}`);
        return cachedData;
      }
    }
    
    // If all else fails, try to generate mock data based on the metricId
    console.log(`Generating fallback mock data for ${metricId}`);
    return generateMockData(query, metricId);
  }
}

/**
 * Fetch data for all metrics
 * @param {boolean} useMock - Whether to use mock data
 * @param {boolean} useCached - Whether to use cached data
 * @returns {Promise<Object>} Object with metric data
 */
async function fetchAllMetricsData(useMock = false, useCached = true) {
  // Get all metric IDs
  const metricIds = availableMetrics;
  
  console.log(`Fetching data for ${metricIds.length} metrics: ${metricIds.join(', ')}`);
  
  // Fetch each metric in parallel
  const promises = metricIds.map(metricId => 
    fetchMetricData(metricId, useMock, useCached)
      .then(data => ({ [metricId]: data }))
      .catch(error => {
        console.error(`Error fetching ${metricId}:`, error);
        return { [metricId]: [] };
      })
  );
  
  // Combine all results
  const results = await Promise.all(promises);
  const combined = Object.assign({}, ...results);
  
  console.log(`All metrics fetched. Results:`, Object.keys(combined).map(key => `${key}: ${combined[key]?.length || 0} records`));
  
  return combined;
}

/**
 * Generate mock data for development/testing
 * @param {string} query - The original query
 * @param {string} metricId - Optional metric ID
 * @returns {Array} Mock data points
 */
function generateMockData(query, metricId = null) {
  console.log(`Generating mock data for ${metricId}`);
  
  // For historical_yield_sdai, generate multi-series data
  if (metricId === 'historical_yield_sdai') {
    const mockDataPoints = [];
    const labels = ['7DMM', '30DMM', 'Daily'];
    const startDate = new Date('2023-10-12');
    const endDate = new Date();
    
    // Generate data for each day
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0] + ' 00:00:00';
      
      labels.forEach(label => {
        mockDataPoints.push({
          date: dateStr,
          label: label,
          apy: Math.random() * 5 + 8 // Random APY between 8-13%
        });
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Generated ${mockDataPoints.length} mock data points for ${metricId}`);
    return mockDataPoints;
  }
  
  // Extract date range from query
  const fromMatch = query.match(/BETWEEN '(.+?)'/);
  const toMatch = query.match(/AND '(.+?)'/);
  
  const from = fromMatch ? fromMatch[1] : getDefaultFromDate();
  const to = toMatch ? toMatch[1].split(' ')[0] : getTodayDate();
  
  // Detect if query returns a complex multi-series result
  const hasMultipleSeries = query.includes('SUM(if') || query.includes('COUNT(if');
  
  if (hasMultipleSeries) {
    return mockData.generateClientDistributionData(from, to);
  } else {
    // For simple metrics
    return mockData.generateMetricData(metricId || 'unknown', from, to);
  }
}

/**
 * Get the default "from" date (90 days ago)
 * @returns {string} Date in YYYY-MM-DD format
 */
function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date
 * @returns {string} Date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}