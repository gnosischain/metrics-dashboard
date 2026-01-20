/**
 * Configuration settings for the dashboard
 */
const config = {
  // ClickHouse API configuration (not used directly by frontend)
  clickhouse: {
    host: import.meta.env.VITE_CLICKHOUSE_HOST,
    user: import.meta.env.VITE_CLICKHOUSE_USER,
    password: import.meta.env.VITE_CLICKHOUSE_PASSWORD
  },
  
  // API proxy configuration
  api: {
    // For Vercel deployment, use relative path to API endpoints
    url: import.meta.env.VITE_API_URL || '/api',
    key: import.meta.env.VITE_API_KEY || 'dev-key-12345',
    useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || import.meta.env.DEV
  },
  
  // Dashboard configuration
  dashboard: {
    title: import.meta.env.VITE_DASHBOARD_TITLE || 'Gnosis Analytics Dashboard'
  }
};

console.log('Configuration loaded:', {
  apiUrl: config.api.url,
  useMockData: config.api.useMockData,
  hasApiKey: !!config.api.key,
  environment: import.meta.env.MODE
});
  
export default config;