import { getBooleanEnvValue, getEnvValue, getRuntimeMode, isDevelopment } from './env';

/**
 * Configuration settings for the dashboard
 */
const config = {
  // ClickHouse API configuration (not used directly by frontend)
  clickhouse: {
    host: getEnvValue('VITE_CLICKHOUSE_HOST', 'REACT_APP_CLICKHOUSE_HOST'),
    user: getEnvValue('VITE_CLICKHOUSE_USER', 'REACT_APP_CLICKHOUSE_USER'),
    password: getEnvValue('VITE_CLICKHOUSE_PASSWORD', 'REACT_APP_CLICKHOUSE_PASSWORD')
  },
  
  // API proxy configuration
  api: {
    // For Vercel deployment, use relative path to API endpoints
    url: getEnvValue('VITE_API_URL', 'REACT_APP_API_URL', '/api'),
    key: getEnvValue('VITE_API_KEY', 'REACT_APP_API_KEY', 'dev-key-12345'),
    // Allow explicit override in dev; default to mock only if env var is unset
    useMockData: (() => {
      const hasExplicitFlag =
        getEnvValue('VITE_USE_MOCK_DATA', null) !== undefined ||
        getEnvValue(null, 'REACT_APP_USE_MOCK_DATA') !== undefined;
      if (hasExplicitFlag) {
        return getBooleanEnvValue('VITE_USE_MOCK_DATA', 'REACT_APP_USE_MOCK_DATA', false);
      }
      return isDevelopment;
    })()
  },
  
  // Dashboard configuration
  dashboard: {
    title: getEnvValue('VITE_DASHBOARD_TITLE', 'REACT_APP_DASHBOARD_TITLE', 'Gnosis Analytics Dashboard')
  }
};

console.log('Configuration loaded:', {
  apiUrl: config.api.url,
  useMockData: config.api.useMockData,
  hasApiKey: !!config.api.key,
  environment: getRuntimeMode()
});
  
export default config;
