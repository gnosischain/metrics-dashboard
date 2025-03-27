# Metrics Dashboard

A simple, modular dashboard to visualize ClickHouse metrics built with React and deployed on Vercel.

## Features

- Connects to ClickHouse Cloud via API
- Secure handling of credentials (not exposed to frontend)
- Responsive design for all devices
- Auto-refresh with configurable interval
- Modular architecture for easy addition of new metrics
- Deployment to Vercel with serverless functions

## Available Metrics

- Query Count - Number of queries executed
- Data Processed - Amount of data processed by queries
- Average Query Time - Average query execution time
- Error Rate - Percentage of failed queries

## Architecture

This application follows a two-component architecture to securely handle ClickHouse credentials:

1. **Frontend Dashboard** - React application deployed to Vercel
   - Visualizes metrics data using Chart.js
   - Fetches data from a secure API proxy

2. **API Proxy** - Serverless API functions that interface with ClickHouse
   - Handles authentication securely
   - Executes queries and returns results to the dashboard
   - Deployed as Vercel Serverless Functions in the same project

## Quick Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/clickhouse-metrics-dashboard.git
   cd clickhouse-metrics-dashboard
   ```

2. Install dependencies (including API dependencies):
   ```bash
   # Install main project dependencies
   npm install
   
   # Install API dependencies
   cd api && npm install && cd ..
   ```

3. Create `.env` file with your configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
├── README.md
├── api/                     # API proxy serverless functions
│   ├── metrics.js           # Main API endpoint for metrics
│   ├── package.json         # API dependencies
│   └── queries/             # Query definitions as JSON
├── public/                  # Static assets
├── scripts/
│   └── export-queries.js    # Script to export queries from frontend to API
├── src/
│   ├── components/          # React components
│   ├── queries/             # Metric query definitions
│   ├── services/            # API and data services
│   └── utils/               # Utility functions
└── vercel.json              # Vercel deployment configuration
```

## Vercel Deployment

### Prerequisites

To deploy this dashboard, you'll need:

1. A Vercel account
2. A ClickHouse instance or ClickHouse Cloud account
3. Your ClickHouse connection details

### Preparing for Deployment

1. **Ensure API dependencies are properly configured**:

   Make sure your `api/package.json` contains the necessary dependencies:
   ```json
   {
     "name": "clickhouse-metrics-api",
     "version": "1.0.0",
     "description": "API for ClickHouse metrics dashboard",
     "main": "metrics.js",
     "dependencies": {
       "axios": "^1.6.2",
       "cors": "^2.8.5"
     }
   }
   ```

2. **Update your main `package.json`** to include pre-build scripts:
   ```json
   {
     "scripts": {
       "start": "react-scripts start",
       "build": "DISABLE_ESLINT_PLUGIN=true react-scripts build",
       "preinstall": "cd api && npm install",
       "prebuild": "cd api && npm install",
       "test": "react-scripts test",
       "eject": "react-scripts eject",
       "export-queries": "node scripts/export-queries.js",
       "vercel-build": "npm run export-queries && npm run prebuild && DISABLE_ESLINT_PLUGIN=true npm run build"
     }
   }
   ```

3. **Update `vercel.json`** to ensure proper builds and dependency installation:
   ```json
   {
     "version": 2,
     "builds": [
       { 
         "src": "api/**/*.js", 
         "use": "@vercel/node",
         "config": {
           "includeFiles": ["api/package.json", "api/node_modules/**"]
         }
       },
       { 
         "src": "package.json", 
         "use": "@vercel/static-build", 
         "config": { 
           "distDir": "build" 
         }
       }
     ],
     "routes": [
       { 
         "src": "/api/metrics", 
         "dest": "/api/metrics.js",
         "headers": {
           "Access-Control-Allow-Credentials": "true",
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
           "Access-Control-Allow-Headers": "X-API-Key,X-Requested-With,Content-Type,Accept,Origin"
         }
       },
       { 
         "src": "/api/metrics/(.*)", 
         "dest": "/api/metrics.js",
         "headers": {
           "Access-Control-Allow-Credentials": "true",
           "Access-Control-Allow-Origin": "*",
           "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
           "Access-Control-Allow-Headers": "X-API-Key,X-Requested-With,Content-Type,Accept,Origin"
         }
       },
       { "src": "/(.*)", "dest": "/$1" }
     ]
   }
   ```

4. **Test locally with Vercel CLI**:
   ```bash
   # Install Vercel CLI globally if not installed
   npm install -g vercel
   
   # Test the build locally
   vercel dev
   ```

### Deployment Steps

1. **Install and log in to Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy with force flag** to ensure clean dependency installation:
   ```bash
   vercel --force
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
     - `REACT_APP_REFRESH_INTERVAL` (optional): Refresh interval in milliseconds

4. **Deploy to production** with environment variables:
   ```bash
   vercel --prod
   ```

### Troubleshooting Deployment Issues

If you encounter issues with dependencies in Vercel:

1. **Verify Dependencies Installation**:
   Check the build logs to see if dependencies are being installed correctly:
   ```bash
   vercel logs your-deployment-url --source=build
   ```

2. **Force NPM Installation in API Directory**:
   Create a file called `api/build.js` and include it in your deployment:
   ```javascript
   const { exec } = require('child_process');
   const path = require('path');

   // Run npm install in the api directory
   exec('npm install', { cwd: path.join(__dirname) }, (error, stdout, stderr) => {
     if (error) {
       console.error(`Error installing API dependencies: ${error}`);
       return;
     }
     console.log(`API dependencies installed: ${stdout}`);
   });
   ```

3. **Use Mock Data Temporarily**:
   As a workaround during deployment testing, you can set `USE_MOCK_DATA=true` in your environment variables to bypass the need for API calls to ClickHouse.

4. **Check Vercel Runtime Logs**:
   ```bash
   vercel logs your-deployment-url
   ```

5. **Check for Dependency Conflicts**:
   Sometimes specific versions of axios might have compatibility issues. Try updating to the latest version:
   ```bash
   cd api && npm install axios@latest && cd ..
   ```

6. **Manual Deployment of API Dependencies**:
   If all else fails, you can try to manually include the node_modules in your deployment:
   ```bash
   # Install API dependencies locally
   cd api && npm install && cd ..
   
   # Create a .vercelignore file to prevent ignoring node_modules in API
   echo '!api/node_modules' > .vercelignore
   
   # Deploy with all files
   vercel --force
   ```

## API Proxy Implementation

The API proxy is implemented as a Vercel Serverless Function in `api/metrics.js`. It provides the following endpoints:

- `GET /api/metrics`: Get data for all metrics
- `GET /api/metrics/{metricId}`: Get data for a specific metric

### API Setup for Serverless Deployment

For proper deployment as a serverless function, ensure:

1. Your API functions have their **own package.json** with all required dependencies
2. The **directory structure** follows Vercel conventions (functions in `api/` directory)
3. The `vercel.json` **build configuration** is correctly set up to include API files
4. API **dependencies are installed** during the build process

### Security Considerations

1. API authentication is handled with a custom API key header:
   ```
   X-API-Key: your-api-key
   ```

2. CORS headers are configured in `vercel.json` to allow cross-origin requests.

3. ClickHouse credentials are stored as environment variables and never exposed to the client.

### API Request Parameters

The API accepts the following parameters:

- `from`: Start date in YYYY-MM-DD format
- `to`: End date in YYYY-MM-DD format
- `range`: Shorthand date range (e.g., `7d`, `30d`)

Example request:
```
GET /api/metrics/queryCount?from=2023-01-01&to=2023-01-31
```

## Development Mode

For local development without ClickHouse:

1. Set the `USE_MOCK_DATA` environment variable to `true`:
   ```
   USE_MOCK_DATA=true
   ```

2. The API will generate mock data instead of querying ClickHouse.

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

## Complete Package Configuration

### Main `package.json`

```json
{
  "name": "metrics-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "DISABLE_ESLINT_PLUGIN=true react-scripts build",
    "preinstall": "cd api && npm install",
    "prebuild": "cd api && npm install",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "export-queries": "node scripts/export-queries.js",
    "vercel-build": "npm run export-queries && npm run prebuild && DISABLE_ESLINT_PLUGIN=true npm run build"
  },
  "dependencies": {
    "axios": "^1.6.2",
    "chart.js": "^4.4.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "cors": "^2.8.5"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ],
    "rules": {
      "import/no-anonymous-default-export": "off",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "vercel": "^32.7.0"
  }
}
```

### API `package.json`

```json
{
  "name": "clickhouse-metrics-api",
  "version": "1.0.0",
  "description": "API for ClickHouse metrics dashboard",
  "main": "metrics.js",
  "dependencies": {
    "axios": "^1.6.2",
    "cors": "^2.8.5"
  }
}
```

## License

MIT