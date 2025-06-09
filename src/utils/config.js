/**
 * Configuration settings for the dashboard
 */
const config = {
  // ClickHouse API configuration (not used directly by frontend)
  clickhouse: {
    host: process.env.REACT_APP_CLICKHOUSE_HOST,
    user: process.env.REACT_APP_CLICKHOUSE_USER,
    password: process.env.REACT_APP_CLICKHOUSE_PASSWORD
  },
  
  // API proxy configuration
  api: {
    // For Vercel deployment, use relative path to API endpoints
    url: process.env.REACT_APP_API_URL || '/api',
    key: process.env.REACT_APP_API_KEY || 'dev-key-12345',
    useMockData: process.env.REACT_APP_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development'
  },
  
  // Dashboard configuration
  dashboard: {
    title: process.env.REACT_APP_DASHBOARD_TITLE || 'Gnosis Analytics Dashboard'
  }
};

console.log('Configuration loaded:', {
  apiUrl: config.api.url,
  useMockData: config.api.useMockData,
  hasApiKey: !!config.api.key,
  environment: process.env.NODE_ENV
});
  
export default config;