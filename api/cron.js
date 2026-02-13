const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cacheManager = require('./cache');

function resolveDbtSchema() {
  const rawSchema = process.env.CLICKHOUSE_DBT_SCHEMA;
  const schema = (rawSchema ?? 'dbt').trim();
  const isValid = schema !== '' && /^[A-Za-z0-9_]+$/.test(schema);

  if (!isValid) {
    if (rawSchema !== undefined) {
      console.warn(
        `Invalid CLICKHOUSE_DBT_SCHEMA "${rawSchema}". Falling back to "dbt".`
      );
    }
    return 'dbt';
  }

  return schema;
}

function applyDbtSchema(query) {
  const schema = resolveDbtSchema();
  if (schema === 'dbt') {
    return query;
  }
  return query.replace(/\bdbt\./gi, `${schema}.`);
}

/**
 * Simple cron-like functionality for refreshing the cache daily
 */
class CronManager {
  constructor() {
    // Path to the timestamp file - use /tmp for Vercel serverless compatibility
    this.timestampFile = path.join('/tmp', 'cache', 'last_refresh.txt');
    
    // Default refresh interval in milliseconds (24 hours)
    this.refreshInterval = process.env.CACHE_REFRESH_HOURS 
      ? parseInt(process.env.CACHE_REFRESH_HOURS) * 60 * 60 * 1000 
      : 24 * 60 * 60 * 1000;
    
    // In-memory timestamp fallback
    this.lastRefreshTimestamp = null;
    
    // Flag to indicate if file system is available
    this.useMemoryOnly = false;
    
    // Ensure the parent directory exists
    try {
      const dir = path.dirname(this.timestampFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (error) {
      console.error(`Failed to create timestamp directory: ${error.message}`);
      this.useMemoryOnly = true;
      console.log('Using in-memory timestamp as fallback');
    }
      
    console.log(`Cron initialized with refresh interval: ${this.refreshInterval / (60 * 60 * 1000)} hours`);
  }

  getDbtSchema() {
    return resolveDbtSchema();
  }

  /**
   * Check if the cache needs refreshing
   * @returns {boolean} True if refresh is needed
   */
  needsRefresh() {
    try {
      // Use in-memory timestamp if file system is not available
      if (this.useMemoryOnly) {
        return !this.lastRefreshTimestamp || 
               (Date.now() - this.lastRefreshTimestamp) > this.refreshInterval;
      }
      
      // Check if the timestamp file exists
      if (!fs.existsSync(this.timestampFile)) {
        return true;
      }
      
      // Read the timestamp file
      const timestamp = parseInt(fs.readFileSync(this.timestampFile, 'utf8'));
      
      // Check if enough time has elapsed
      const elapsed = Date.now() - timestamp;
      return elapsed > this.refreshInterval;
    } catch (error) {
      console.error('Error checking refresh status:', error);
      return true; // Refresh on error to be safe
    }
  }

  /**
   * Update the timestamp file
   */
  updateTimestamp() {
    const now = Date.now();
    
    try {
      // Update in-memory timestamp
      this.lastRefreshTimestamp = now;
      
      // If using only memory, we're done
      if (this.useMemoryOnly) {
        return;
      }
      
      // Otherwise update the file
      fs.writeFileSync(this.timestampFile, now.toString());
    } catch (error) {
      console.error('Error updating timestamp:', error);
      // Fall back to memory-only mode if file write fails
      this.useMemoryOnly = true;
    }
  }

  /**
   * Refresh the cache for a specific metric
   * @param {string} metricId - Metric identifier
   * @param {Object} queries - Query definitions
   * @returns {Promise<boolean>} True if refresh was successful
   */
  async refreshMetricCache(metricId, queries) {
    try {
      console.log(`Refreshing cache for metric: ${metricId}`);
      
      // Get the query for this metric
      const query = queries[metricId];
      if (!query) {
        console.error(`No query found for metric: ${metricId}`);
        return false;
      }
      
      // Default to last 90 days if no range specified
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 90);
      
      // Format dates for query
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      
      // Replace placeholders in query
      const queryStr = query.replace(/\{from\}/g, fromStr).replace(/\{to\}/g, toStr);
      
      // Execute query against ClickHouse
      const result = await this.executeClickHouseQuery(queryStr);
      
      // Save to cache
      if (result && result.length > 0) {
        cacheManager.setCache(metricId, result);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error refreshing cache for ${metricId}:`, error);
      return false;
    }
  }
  
  /**
   * Execute a query against ClickHouse
   * @param {string} query - SQL query to execute
   * @returns {Promise<Array>} Query results
   */
  async executeClickHouseQuery(query) {
    try {
      // Check if ClickHouse connection details are available
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
      
      // Apply dbt schema override if configured
      const finalQuery = applyDbtSchema(query);

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
          query: finalQuery,
          database: clickhouseDatabase,
          default_format: 'JSONEachRow'
        },
        timeout: 15000 // 15 second timeout
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
      console.error('Query execution error:', error.message);
      throw error;
    }
  }

  /**
   * Refresh all metric caches
   * @param {Object} queries - All query definitions
   * @returns {Promise<Object>} Result status for each metric
   */
  async refreshAllCaches(queries) {
    try {
      console.log('Starting cache refresh for all metrics');
      
      const metricIds = Object.keys(queries);
      const results = {};
      
      for (const metricId of metricIds) {
        results[metricId] = await this.refreshMetricCache(metricId, queries);
      }
      
      // Update timestamp after refreshing all
      this.updateTimestamp();
      
      console.log('Completed cache refresh for all metrics');
      return results;
    } catch (error) {
      console.error('Error refreshing all caches:', error);
      return {};
    }
  }
  
  /**
   * Check and refresh caches if needed
   * @param {Object} queries - All query definitions
   * @returns {Promise<boolean>} True if refresh was performed
   */
  async checkAndRefreshIfNeeded(queries) {
    if (this.needsRefresh()) {
      console.log('Cache refresh needed, performing refresh');
      await this.refreshAllCaches(queries);
      return true;
    }
    
    console.log('Cache refresh not needed');
    return false;
  }
}

module.exports = new CronManager();
