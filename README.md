# ClickHouse Metrics Dashboard

A simple, modular dashboard to visualize ClickHouse metrics built with React and deployed on Vercel with server-side caching.

## Features

- Connects to ClickHouse Cloud via API
- Server-side caching to minimize ClickHouse queries
- Secure handling of credentials (not exposed to frontend)
- Responsive design for all devices
- Simplified UI with single-column metric display
- Modular architecture for easy addition of new metrics
- Deployment to Vercel with serverless functions

## Available Metrics

- Query Count - Number of queries executed
- Data Processed - Amount of data processed by queries
- Average Query Time - Average query execution time
- Error Rate - Percentage of failed queries

## Architecture

This application follows a two-component architecture with server-side caching:

1. **Frontend Dashboard** - React application deployed to Vercel
   - Visualizes metrics data using Chart.js
   - Fetches data from a secure API proxy

2. **API Proxy** - Serverless API functions that interface with ClickHouse
   - Handles authentication securely
   - Implements caching to minimize ClickHouse queries
   - Executes queries and returns results to the dashboard
   - Deployed as Vercel Serverless Functions in the same project

3. **Caching System** - Reduces load on ClickHouse
   - Uses `/tmp` directory in Vercel functions for file-based caching
   - Falls back to in-memory caching if file operations fail
   - Automatic daily refresh of cache data
   - Configurable TTL (time to live) for cache entries

## Quick Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/clickhouse-metrics-dashboard.git
   cd clickhouse-metrics-dashboard
   ```

2. Install dependencies (including API dependencies):
   ```bash
   # Install project dependencies
   pnpm install
   ```

3. Create `.env` file with your configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. Start the development server:
   ```bash
   pnpm start
   ```

## Project Structure

```
├── README.md
├── api/
│   ├── cache.js                # Cache management implementation
│   ├── cron.js                 # Automatic refresh functionality
│   ├── metrics.js              # Main API endpoint with caching support
│   ├── mock.js                 # Mock data generator
│   ├── test.js                 # Cache status API endpoint
│   ├── package.json            # API dependencies
│   └── queries/                # Query definitions as JSON
├── public/                     # Static assets
├── scripts/
│   └── export-queries.js       # Script to export queries from frontend to API
├── src/
│   ├── components/
│   │   ├── Card.js             # Card component 
│   │   ├── Chart.js            # Chart component
│   │   ├── Dashboard.js        # Main dashboard component
│   │   ├── Header.js           # Simplified header component
│   │   └── MetricWidget.js     # Individual metric display
│   ├── services/
│   │   ├── api.js              # API service with cache support
│   │   └── metrics.js          # Metrics service
│   ├── queries/                # Frontend metric definitions
│   ├── utils/
│   │   ├── config.js           # Application configuration
│   │   ├── dates.js            # Date utilities
│   │   └── formatter.js        # Value formatters
│   └── styles.css              # Application styles
└── vercel.json                 # Vercel deployment configuration
```

## Caching System

The dashboard implements a server-side caching system to minimize ClickHouse queries:

### How Caching Works

1. **First Request**: On first request, the system queries ClickHouse and caches the results
2. **Subsequent Requests**: Future requests use cached data (until cache expires)
3. **Automatic Refresh**: Cache is automatically refreshed once per day
4. **Fallback Mechanism**: If ClickHouse queries fail, system uses cached data

### Cache Configuration

Configure caching behavior with these environment variables:

- `CACHE_TTL_HOURS`: How long cache entries are valid (default: 24 hours)
- `CACHE_REFRESH_HOURS`: How often the cache is refreshed (default: 24 hours)

### Vercel Deployment Considerations

When deploying to Vercel's serverless environment:

1. **File System Limitations**: The system uses `/tmp` directory for caching
2. **In-Memory Fallback**: Falls back to in-memory caching if file operations fail
3. **Ephemeral Storage**: Cache might reset between function invocations

### Checking Cache Status

Check cache status by visiting:
```
https://your-deployment-url/api/test
```

Include your API key in the `X-API-Key` header.

### Manual Cache Refresh

Force a cache refresh by adding `refreshCache=true` to your API requests:
```
https://your-deployment-url/api/metrics?refreshCache=true
```

## Vercel Deployment

### Prerequisites

To deploy this dashboard, you'll need:

1. A Vercel account
2. A ClickHouse instance or ClickHouse Cloud account
3. Your ClickHouse connection details

### Deployment Steps

1. **Install and log in to Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy with Vercel**:
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel**:
   - Go to your project in the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add the following environment variables:
     - `CLICKHOUSE_HOST`: Your ClickHouse host URL
     - `CLICKHOUSE_USER`: ClickHouse username
     - `CLICKHOUSE_PASSWORD`: ClickHouse password
     - `CLICKHOUSE_DATABASE` (optional): Database name 
     - `API_KEY`: A secure key for API authentication
     - `REACT_APP_API_URL`: `/api` (relative path)
     - `REACT_APP_API_KEY`: Same value as `API_KEY`
     - `REACT_APP_DASHBOARD_TITLE` (optional): Custom dashboard title
     - `CACHE_TTL_HOURS` (optional): Cache validity period in hours
     - `CACHE_REFRESH_HOURS` (optional): Cache refresh interval in hours

### Troubleshooting Deployment Issues

If you encounter issues:

1. **Check Vercel Logs**:
   ```bash
   vercel logs your-deployment-url
   ```

2. **Check Cache Status**:
   Visit `/api/test` to see cache information.

3. **Use Mock Data Temporarily**:
   Set `USE_MOCK_DATA=true` in environment variables during testing.

## Adding New Metrics

To add a new metric:

1. Add a new metric query file in `src/queries/`:
   ```javascript
   // src/queries/newMetric.js
   const newMetric = {
     id: 'newMetricId',
     name: 'New Metric Name',
     description: 'Description of the new metric',
     format: 'formatNumber', // Use existing formatter or add new in formatter.js
     chartType: 'line',
     color: '#00BCD4',
     query: `
       SELECT 
         toDate(event_time) AS date, 
         count() AS value
       FROM your_table
       WHERE event_time BETWEEN '{from}' AND '{to} 23:59:59'
       GROUP BY date
       ORDER BY date
     `
   };
   
   export default newMetric;
   ```

2. Import the new metric in `src/queries/index.js`:
   ```javascript
   import newMetric from './newMetric';
   
   const allQueries = [
     // Existing metrics
     newMetric
   ];
   
   export default allQueries;
   ```

3. Run the export script to update the API:
   ```bash
   npm run export-queries
   ```

4. Deploy your changes to Vercel:
   ```bash
   vercel --prod
   ```

## Development Mode

For local development without ClickHouse:

1. Set the `USE_MOCK_DATA` environment variable to `true`:
   ```
   USE_MOCK_DATA=true
   ```

2. The API will generate mock data instead of querying ClickHouse.

## License

This project is licensed under the [MIT License](LICENSE).