/**
 * Mock data generator for testing
 */

/**
 * Generate client distribution data (dataSize metric)
 * @param {string} from - Start date
 * @param {string} to - End date
 * @returns {Array} Generated client distribution data
 */
function generateClientDistributionData(from, to) {
    const data = [];
    const fromDate = new Date(from);
    const toDate = new Date(to);
    let currentDate = new Date(fromDate);
    
    // Generate hourly data for every 4 hours
    while (currentDate <= toDate) {
      for (let hour = 0; hour < 24; hour += 4) {
        // Format as "YYYY-MM-DD HH:00:00"
        const hourStr = `${currentDate.toISOString().split('T')[0]} ${String(hour).padStart(2, '0')}:00:00`;
        
        // Generate values with some trends
        const timeOfDay = hour;
        const dayMultiplier = timeOfDay >= 8 && timeOfDay <= 16 ? 1.5 : 1; // Higher during work hours
        
        data.push({
          hour: hourStr,
          Lighthouse: Math.floor((Math.random() * 50 + 250) * dayMultiplier),
          Teku: Math.floor((Math.random() * 30 + 180) * dayMultiplier),
          Lodestar: Math.floor((Math.random() * 20 + 120) * dayMultiplier),
          Nimbus: Math.floor((Math.random() * 15 + 95) * dayMultiplier),
          Erigon: Math.floor((Math.random() * 10 + 45) * dayMultiplier),
          Unknown: Math.floor((Math.random() * 5 + 20) * dayMultiplier)
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }
  
  /**
   * Generate simple metric data
   * @param {string} metricId - Metric ID
   * @param {string} from - Start date
   * @param {string} to - End date
   * @returns {Array} Generated metric data
   */
  function generateMetricData(metricId, from, to) {
    const data = [];
    const fromDate = new Date(from);
    const toDate = new Date(to);
    let currentDate = new Date(fromDate);
    
    // Generate daily data points
    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      let value;
      switch (metricId) {
        case 'queryCount':
          value = Math.floor(Math.random() * 100000) + 100000;
          break;
        case 'queryDuration':
          value = (Math.random() * 0.2 + 0.8).toFixed(3);
          break;
        case 'errorRate':
          value = (Math.random() * 0.5 + 0.1).toFixed(2);
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }
      
      data.push({ date: dateStr, value });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  }
  
  module.exports = {
    generateClientDistributionData,
    generateMetricData
  };