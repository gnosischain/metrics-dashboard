# ClickHouse Metrics Dashboard

A modular analytics dashboard for Gnosis metrics built with React, ECharts, YAML-driven layouts, and a cached ClickHouse-backed API.

## Features

- Connects to ClickHouse Cloud via API
- Server-side caching to minimize ClickHouse queries
- Secure handling of credentials (not exposed to frontend)
- YAML-driven dashboards/tabs/card layouts
- ECharts-based chart rendering with expand/info/download controls
- Header metric search with fuzzy matching and direct dashboard/tab navigation
- Responsive design with dark mode support
- Deployment to Vercel with serverless functions

## Dashboard Areas

Configured areas live in YAML and currently include:

- Overview
- Gnosis Pay
- OnChain Activity
- Consensus
- Network
- Bridges
- Tokens
- Yields
- ESG

## Architecture

This application follows a config-driven frontend + API architecture with server-side caching:

1. **Frontend Dashboard** - React application deployed to Vercel
   - Resolves dashboard layout from `public/dashboard.yml` and `public/dashboards/*.yml`
   - Merges layout entries with metric definitions from `src/queries/*.js`
   - Renders widgets/cards using ECharts and shared UI components

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
   pnpm dev
   ```

5. Run tests and production build:
   ```bash
   pnpm test
   pnpm build
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
│   ├── dashboard.yml           # Main sector index (order + icons + source)
│   └── dashboards/             # Per-sector layouts (metrics/tabs)
├── scripts/
│   └── export-queries.js       # Script to export queries from frontend to API
├── src/
│   ├── components/
│   │   ├── Card.js             # Card component 
│   │   ├── Dashboard.js        # Main dashboard component
│   │   ├── Header.js           # Top header (search/resources/theme)
│   │   ├── MetricSearchBar.js  # Header metric search dropdown
│   │   └── MetricWidget.js     # Individual metric display
│   ├── services/
│   │   ├── api.js              # API service with cache support
│   │   ├── dashboards.js       # Dashboard/tab/layout resolution service
│   │   └── metrics.js          # Metric config + data service
│   ├── queries/                # Frontend metric definitions
│   ├── utils/
│   │   ├── dashboardConfig.js  # Loads and resolves YAML config
│   │   ├── metricSearch.js     # Search index + scoring logic
│   │   ├── config.js           # Application configuration
│   │   ├── dates.js            # Date utilities
│   │   └── formatter.js        # Value formatters
│   └── styles.css              # Application styles
└── vercel.json                 # Vercel deployment configuration
```

## Dashboard Configuration

The dashboard config is split into:

1. `public/dashboard.yml` for sector metadata and ordering.
2. `public/dashboards/<sector>.yml` for each sector layout (`metrics` or `tabs`).

Main file example:

```yaml
Overview:
  name: Overview
  order: 1
  icon: "📊"
  iconClass: "chart-line"
  source: /dashboards/overview.yml
```

Sector file example:

```yaml
metrics:
  - id: overview_stake_api
    gridRow: 1
    gridColumn: 1 / span 3
    minHeight: 130px
```

How to add a new sector:

1. Create `public/dashboards/<new-sector>.yml` with `metrics` or `tabs`.
2. Add a top-level entry in `public/dashboard.yml` with `name`, `order`, `icon`, `iconClass`, and `source`.
3. Start the app and verify the new sector appears in navigation.

## How Dashboard Rendering Works

1. **Config load at startup**
   - `src/utils/dashboardConfig.js` loads `/dashboard.yml`.
   - If a sector defines `source`, it loads and merges `/dashboards/<sector>.yml`.
   - Resolved YAML is passed to `src/services/dashboards.js`.
2. **Layout resolution**
   - Each dashboard/tab metric ID is merged with its base metric config from `src/queries/*.js`.
   - Grid placement (`gridRow`, `gridColumn`, `minHeight`) comes from YAML.
3. **Navigation state**
   - `src/components/Dashboard.js` manages active dashboard/tab and syncs `?dashboard=&tab=` in the URL.
4. **Widget data flow**
   - `MetricWidget` loads metric config from `metricsService`.
   - Data is fetched via `/api/metrics/:metricId`.
   - Text widgets can render static content without API calls.
5. **Filters**
   - `global_filter` is a pseudo-metric used only for UI placement in the grid.
   - Global filter values are fetched once from a suitable metric and then reused across cards in the tab.
6. **Card text fields**
   - `description`: subtitle shown under the card title.
   - `metricDescription`: markdown content shown in the info popover.
7. **Chart controls**
   - Chart cards include info popover, PNG download, and expand-to-modal controls.

## Header Metric Search

The header search is designed for fast tab jumps.

1. **Scope**
   - Search index is built only from resolved dashboard YAML metrics (`dashboard -> tab -> metrics`).
   - Metrics that exist in `src/queries` but are not placed in any YAML tab are intentionally excluded.
2. **Exclusions**
   - Non-navigable pseudo entries like `global_filter` are excluded.
3. **Matching + ranking**
   - Highest priority: metric name exact/prefix/token matches.
   - Then: metric ID token matches.
   - Then: tab/dashboard/description/metricDescription context matches.
   - Includes light typo tolerance (edit distance 1 for longer tokens).
4. **Result limits**
   - Default maximum is 8 results for speed and clarity.
5. **Duplicate labels**
   - If multiple results share the same `Metric Name + Dashboard/Tab`, the UI appends a qualifier
     (description, or metricDescription, or metric ID fallback) to disambiguate.
6. **Navigation behavior**
   - Selecting a result jumps directly to its dashboard and tab (no card auto-scroll in this phase).
7. **Keyboard controls**
   - `ArrowUp` / `ArrowDown` to move selection
   - `Enter` to navigate
   - `Escape` to close suggestions
   - Outside click closes suggestions

## Header Resource Links

The top-bar `Resources` menu is fully config-driven from:

`/Users/hugser/Documents/Gnosis/repos/metrics-dashboard/src/config/headerLinks.js`

To add or update links, edit `HEADER_RESOURCE_LINKS` using the grouped structure below:

```js
export const HEADER_RESOURCE_LINKS = [
  {
    id: 'api',
    label: 'API',
    links: [{ id: 'api-reference', label: 'API Reference', href: 'https://your-url' }]
  }
];
```

Each group renders a section in the dropdown, and each link opens in a new tab.

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

### Environment Cache Behavior

- **Local development (`NODE_ENV=development`)**:
  - Frontend request caching is bypassed.
  - Requests to `/api/metrics` and `/api/metrics/:id` automatically include `useCached=false` unless explicitly provided.
  - API responses include `Cache-Control: no-store, max-age=0` and `Pragma: no-cache`.
- **Production**:
  - Existing cache behavior is unchanged.
  - `useCached` defaults to `true` when omitted.
- **Override support**:
  - You can explicitly set `useCached=true` or `useCached=false` per request in any environment.

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
    - `CLICKHOUSE_DBT_SCHEMA` (optional): dbt schema prefix used to rewrite `dbt.` in queries (default: `dbt`)
    - `API_KEY`: A secure key for API authentication
    - `VITE_API_URL`: `/api` (relative path)
    - `VITE_API_KEY`: Same value as `API_KEY`
    - `VITE_DASHBOARD_TITLE` (optional): Custom dashboard title
    - `VITE_DEV_API_PROXY_TARGET` (optional): Local API proxy target for `pnpm dev`
    - `CACHE_TTL_HOURS` (optional): Cache validity period in hours
    - `CACHE_REFRESH_HOURS` (optional): Cache refresh interval in hours

### Frontend Environment Variables

Vite-prefixed variables are the primary format:

- `VITE_API_URL`
- `VITE_API_KEY`
- `VITE_USE_MOCK_DATA`
- `VITE_DASHBOARD_TITLE`
- `VITE_PUBLIC_BASE_URL` (optional)
- `VITE_DEV_API_PROXY_TARGET` (optional, local dev proxy)

Legacy `REACT_APP_*` variables are still supported as a temporary migration fallback.

### Troubleshooting Deployment Issues

If you encounter issues:

1. **Check Vercel Logs**:
   ```bash
   vercel logs your-deployment-url
   ```

2. **Check Cache Status**:
   Visit `/api/test` to see cache information.

3. **Use Mock Data Temporarily**:
   Set `VITE_USE_MOCK_DATA=true` in environment variables during testing.

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

2. Ensure the metric is placed in dashboard YAML so it becomes visible and searchable:
   - Add it to `public/dashboards/<sector>.yml` under a `metrics` list in the target tab.
   - Metrics not placed in YAML are not rendered and are not included in header search.

3. Run the export script to update the API:
   ```bash
   pnpm run export-queries
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
