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
    key: process.env.REACT_APP_API_KEY || ''
  },
  
  // Dashboard configuration
  dashboard: {
    title: process.env.REACT_APP_DASHBOARD_TITLE || 'ClickHouse Metrics Dashboard',
    refreshInterval: parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '86400000', 10) // Default: 24 hours
  },
  
  // Default date ranges
  dateRanges: {
    default: '7d',
    options: [
      { label: 'Last 24 hours', value: '1d' },
      { label: 'Last 7 days', value: '7d' },
      { label: 'Last 30 days', value: '30d' },
      { label: 'Last 90 days', value: '90d' }
    ]
  }
};
  
export default config;