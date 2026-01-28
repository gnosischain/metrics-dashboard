const fs = require('fs');
const path = require('path');

/**
 * Cache utility for the API
 * Provides a simple file-based caching mechanism
 * Uses /tmp directory for Vercel serverless compatibility
 */
class CacheManager {
  constructor() {
    // Define the cache directory path - use /tmp for Vercel serverless compatibility
    this.cacheDir = path.join('/tmp', 'cache');
    
    // Create the cache directory if it doesn't exist
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      console.log(`Cache directory created at ${this.cacheDir}`);
    } catch (error) {
      console.error(`Failed to create cache directory: ${error.message}`);
      // Fallback to in-memory cache if we can't create the directory
      this.useMemoryCache = true;
      this.memoryCache = {};
      console.log('Using in-memory cache as fallback');
    }
    
    // Default cache TTL (time to live) in milliseconds (24 hours)
    this.cacheTtl = process.env.CACHE_TTL_HOURS 
      ? parseInt(process.env.CACHE_TTL_HOURS) * 60 * 60 * 1000 
      : 24 * 60 * 60 * 1000;
      
    console.log(`Cache initialized with TTL: ${this.cacheTtl / (60 * 60 * 1000)} hours`);
  }

  /**
   * Get the cache file path for a specific metric
   * @param {string} metricId - Metric identifier (or composite cache key)
   * @returns {string} Full path to the cache file
   */
  getCacheFilePath(metricId) {
    // Allow composite cache keys while keeping backwards compatibility:
    // - If metricId is a plain ID (existing behavior), filename stays "<metricId>.json"
    // - If metricId includes special characters, encode it to a filesystem-safe name.
    const safeName = encodeURIComponent(metricId).replace(/%/g, '_');
    return path.join(this.cacheDir, `${safeName}.json`);
  }

  /**
   * Check if a cache file exists and is valid (not expired)
   * @param {string} metricId - Metric identifier
   * @returns {boolean} True if valid cache exists
   */
  isCacheValid(metricId) {
    // Use memory cache if filesystem is not available
    if (this.useMemoryCache) {
      const cacheItem = this.memoryCache[metricId];
      if (!cacheItem || !cacheItem.timestamp || !cacheItem.data) {
        return false;
      }
      const cacheAge = Date.now() - cacheItem.timestamp;
      return cacheAge < this.cacheTtl;
    }
    
    // Otherwise use file-based cache
    const cacheFile = this.getCacheFilePath(metricId);
    
    try {
      // Check if the file exists
      if (!fs.existsSync(cacheFile)) {
        return false;
      }
      
      // Read the cache file
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      
      // Check if the cache has timestamp and data
      if (!cacheData.timestamp || !cacheData.data) {
        return false;
      }
      
      // Check if the cache is expired
      const cacheAge = Date.now() - cacheData.timestamp;
      return cacheAge < this.cacheTtl;
    } catch (error) {
      console.error(`Error checking cache for ${metricId}:`, error);
      return false;
    }
  }

  /**
   * Get data from cache
   * @param {string} metricId - Metric identifier
   * @returns {Object|null} Cache data or null if not found/invalid
   */
  getCache(metricId) {
    if (!this.isCacheValid(metricId)) {
      return null;
    }
    
    try {
      // Use memory cache if filesystem is not available
      if (this.useMemoryCache) {
        return this.memoryCache[metricId].data;
      }
      
      // Otherwise use file-based cache
      const cacheFile = this.getCacheFilePath(metricId);
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return cacheData.data;
    } catch (error) {
      console.error(`Error reading cache for ${metricId}:`, error);
      return null;
    }
  }

  /**
   * Save data to cache
   * @param {string} metricId - Metric identifier
   * @param {Object} data - Data to cache
   * @returns {boolean} True if successfully cached
   */
  setCache(metricId, data) {
    try {
      // Create cache object with timestamp
      const cacheData = {
        timestamp: Date.now(),
        data: data
      };
      
      // Use memory cache if filesystem is not available
      if (this.useMemoryCache) {
        this.memoryCache[metricId] = cacheData;
        return true;
      }
      
      // Otherwise use file-based cache
      const cacheFile = this.getCacheFilePath(metricId);
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing cache for ${metricId}:`, error);
      
      // Try to use memory cache as fallback
      if (!this.useMemoryCache) {
        try {
          this.useMemoryCache = true;
          this.memoryCache = this.memoryCache || {};
          this.memoryCache[metricId] = {
            timestamp: Date.now(),
            data: data
          };
          console.log(`Switched to in-memory cache for ${metricId}`);
          return true;
        } catch (memError) {
          console.error(`Error using memory cache for ${metricId}:`, memError);
        }
      }
      
      return false;
    }
  }

  /**
   * Check when the cache was last updated
   * @param {string} metricId - Metric identifier
   * @returns {Date|null} Timestamp of last update or null if not found
   */
  getLastUpdated(metricId) {
    try {
      // Use memory cache if filesystem is not available
      if (this.useMemoryCache) {
        const cacheItem = this.memoryCache[metricId];
        return cacheItem ? new Date(cacheItem.timestamp) : null;
      }
      
      // Otherwise use file-based cache
      const cacheFile = this.getCacheFilePath(metricId);
      
      if (!fs.existsSync(cacheFile)) {
        return null;
      }
      
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      return new Date(cacheData.timestamp);
    } catch (error) {
      console.error(`Error getting last updated for ${metricId}:`, error);
      return null;
    }
  }

  /**
   * Clear the cache for a specific metric
   * @param {string} metricId - Metric identifier
   * @returns {boolean} True if successfully cleared
   */
  clearCache(metricId) {
    try {
      // Use memory cache if filesystem is not available
      if (this.useMemoryCache) {
        delete this.memoryCache[metricId];
        return true;
      }
      
      // Otherwise use file-based cache
      const cacheFile = this.getCacheFilePath(metricId);
      
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
      }
      
      return true;
    } catch (error) {
      console.error(`Error clearing cache for ${metricId}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache files
   * @returns {boolean} True if successfully cleared
   */
  clearAllCache() {
    try {
      // Use memory cache if filesystem is not available
      if (this.useMemoryCache) {
        this.memoryCache = {};
        return true;
      }
      
      // Otherwise use file-based cache
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(this.cacheDir, file));
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return false;
    }
  }
  
  /**
   * Get a list of all cached metrics
   * @returns {Array} Array of metric IDs that are cached
   */
  getAllCachedMetrics() {
    try {
      // Use memory cache if filesystem is not available
      if (this.useMemoryCache) {
        return Object.keys(this.memoryCache);
      }
      
      // Otherwise use file-based cache
      if (!fs.existsSync(this.cacheDir)) {
        return [];
      }
      
      const files = fs.readdirSync(this.cacheDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('Error getting cached metrics:', error);
      return [];
    }
  }
}

module.exports = new CacheManager();