const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mockData = require('./mock');

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
        const queryDef = JSON.parse(queryContent);
        
        if (queryDef.id && queryDef.query) {
          queries[queryDef.id] = queryDef.query;
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
    // Parse request parameters
    const { metricId } = req.query;
    const from = req.query.from || getDefaultFromDate();
    const to = req.query.to || getTodayDate();
    
    // Check if mock data is requested
    const useMock = req.query.useMock === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    // If a specific metric is requested
    if (metricId) {
      const metricData = await fetchMetricData(metricId, from, to, useMock);
      return res.status(200).json(metricData);
    } 
    
    // If all metrics are requested
    else {
      const allMetricsData = await fetchAllMetricsData(from, to, useMock);
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
 * @param {string} from - Start date in ISO format (YYYY-MM-DD)
 * @param {string} to - End date in ISO format (YYYY-MM-DD)
 * @param {boolean} useMock - Whether to use mock data
 * @returns {Promise<Array>} Array of data points
 */
async function fetchMetricData(metricId, from, to, useMock = false) {
  // Get the query for this metric
  const query = getQueryForMetric(metricId, from, to);
  
  if (!query) {
    const error = new Error(`Unknown metric: ${metricId}`);
    error.status = 400;
    error.code = 'InvalidMetric';
    throw error;
  }
  
  try {
    // Execute the query against ClickHouse or use mock data
    const rawData = useMock 
      ? generateMockData(query, metricId)
      : await executeClickHouseQuery(query);
    
    // Always preserve the original structure of the data
    // This handles both simple date/value and complex multi-column responses
    return rawData;
  } catch (error) {
    console.error(`Error fetching metric ${metricId}:`, error);
    return []; // Return empty array on error
  }
}

/**
 * Fetch data for all metrics
 * @param {string} from - Start date in ISO format (YYYY-MM-DD)
 * @param {string} to - End date in ISO format (YYYY-MM-DD)
 * @param {boolean} useMock - Whether to use mock data
 * @returns {Promise<Object>} Object with metric data
 */
async function fetchAllMetricsData(from, to, useMock = false) {
  // Get all metric IDs
  const metricIds = availableMetrics;
  
  // Fetch each metric in parallel
  const promises = metricIds.map(metricId => 
    fetchMetricData(metricId, from, to, useMock)
      .then(data => ({ [metricId]: data }))
      .catch(error => {
        console.error(`Error fetching ${metricId}:`, error);
        return { [metricId]: [] };
      })
  );
  
  // Combine all results
  const results = await Promise.all(promises);
  return Object.assign({}, ...results);
}

/**
 * Execute a query against ClickHouse
 * @param {string} query - SQL query to execute
 * @returns {Promise<Array>} Query results
 */
async function executeClickHouseQuery(query) {
  try {
    // Check if we're in development mode or USE_MOCK_DATA is enabled
    if (process.env.USE_MOCK_DATA === 'true' || !process.env.CLICKHOUSE_HOST) {
      console.log('Using mock data for query');
      return generateMockData(query);
    }
    
    // Verify ClickHouse connection details
    if (!process.env.CLICKHOUSE_HOST) {
      throw new Error('Missing ClickHouse connection details');
    }
    
    // Determine the proper URL format and connection details
    const clickhouseHost = process.env.CLICKHOUSE_HOST;
    const clickhousePort = process.env.CLICKHOUSE_PORT || '8443';
    const clickhouseUser = process.env.CLICKHOUSE_USER || 'default';
    const clickhousePassword = process.env.CLICKHOUSE_PASSWORD || '';
    const clickhouseDatabase = process.env.CLICKHOUSE_DATABASE || 'default';
    
    // Construct URL if it doesn't include protocol
    const url = clickhouseHost.startsWith('http') 
      ? clickhouseHost 
      : `https://${clickhouseHost}:${clickhousePort}`;
    
    // Execute the actual query
    console.log(`Executing ClickHouse query to ${url}`);
    const response = await axios({
      method: 'post',
      url,
      auth: {
        username: clickhouseUser,
        password: clickhousePassword
      },
      params: {
        query,
        database: clickhouseDatabase,
        default_format: 'JSONEachRow'
      },
      timeout: 8000 // 8 second timeout
    });
    
    // Handle JSONEachRow format (string with newline-separated JSON objects)
    if (typeof response.data === 'string' && response.data.includes('\n')) {
      return response.data
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (err) {
            console.error('Error parsing JSON line:', line);
            return null;
          }
        })
        .filter(item => item !== null);
    }
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (typeof response.data === 'object' && response.data !== null) {
      // If it's a single object or has data property
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        // Convert to array if it's a single object
        return [response.data];
      }
    }
    
    // Return empty array if no valid data
    return [];
  } catch (error) {
    // Handle ClickHouse-specific errors
    if (error.response && error.response.data) {
      console.error('ClickHouse error response:', error.response.data);
      
      const errorObj = new Error('ClickHouse query error');
      errorObj.status = 500;
      errorObj.code = 'ClickHouseError';
      errorObj.details = error.response.data;
      throw errorObj;
    }
    
    // Handle network or other errors
    console.error('Query execution error:', error.message);
    throw new Error(`Failed to execute query: ${error.message}`);
  }
}

/**
 * Get the appropriate query for a given metric
 * @param {string} metricId - Metric identifier
 * @param {string} from - Start date in ISO format
 * @param {string} to - End date in ISO format
 * @returns {string|null} SQL query or null if metric not found
 */
function getQueryForMetric(metricId, from, to) {
  // Get query template for this metric
  const queryTemplate = allQueries[metricId];
  
  if (!queryTemplate) {
    return null;
  }
  
  // Replace placeholders with actual values
  return queryTemplate
    .replace(/\{from\}/g, from)
    .replace(/\{to\}/g, to);
}

/**
 * Generate mock data for development/testing
 * @param {string} query - The original query
 * @param {string} metricId - Optional metric ID
 * @returns {Array} Mock data points
 */
function generateMockData(query, metricId = null) {
  // Extract date range from query
  const fromMatch = query.match(/BETWEEN '(.+?)'/);
  const toMatch = query.match(/AND '(.+?)'/);
  
  const from = fromMatch ? fromMatch[1] : getDefaultFromDate();
  const to = toMatch ? toMatch[1].split(' ')[0] : getTodayDate();
  
  // Check if this is a dataSize metric (complex multi-column query)
  if (metricId === 'dataSize') {
    return mockData.generateClientDistributionData(from, to);
  } else {
    // For simple metrics
    return mockData.generateMetricData(metricId || 'unknown', from, to);
  }
}

/**
 * Get the default "from" date (7 days ago)
 * @returns {string} Date in YYYY-MM-DD format
 */
function getDefaultFromDate() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date
 * @returns {string} Date in YYYY-MM-DD format
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}