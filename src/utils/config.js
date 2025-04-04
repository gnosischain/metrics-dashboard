/**
 * Configuration settings for the dashboard
 */
const config = {
  // ClickHouse API configuration
  clickhouse: {
    host: process.env.REACT_APP_CLICKHOUSE_HOST,
    user: process.env.REACT_APP_CLICKHOUSE_USER,
    password: process.env.REACT_APP_CLICKHOUSE_PASSWORD
  },
  
  // API proxy configuration
  api: {
    // Using relative path for same-domain API endpoints
    url: process.env.REACT_APP_API_URL || '/api',
    key: process.env.REACT_APP_API_KEY || '',
    useMockData: process.env.REACT_APP_USE_MOCK_DATA === 'true'
  },
  
  // Dashboard configuration
  dashboard: {
    title: process.env.REACT_APP_DASHBOARD_TITLE || 'Cerebro Dashboard'
  }
};
  
export default config;