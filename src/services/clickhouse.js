import axios from 'axios';
import config from '../utils/config';

/**
 * ClickHouse service for executing queries
 */
class ClickHouseService {
  constructor() {
    this.host = config.clickhouse.host;
    this.auth = {
      username: config.clickhouse.user,
      password: config.clickhouse.password
    };
  }

  /**
   * Execute a ClickHouse query directly (not exposed to frontend)
   * @param {string} query - SQL query to execute
   * @returns {Promise} Query results
   * @private
   */
  async _executeQuery(query) {
    try {
      const response = await axios({
        method: 'post',
        url: `${this.host}`,
        auth: this.auth,
        params: {
          query: query,
          default_format: 'JSONEachRow'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('ClickHouse query error:', error);
      throw new Error('Failed to execute ClickHouse query');
    }
  }
}

export default new ClickHouseService();