# Metrics Definitions

This directory contains the metric definitions for the ClickHouse Metrics Dashboard.

## Adding a New Metric

To add a new metric to the dashboard:

1. Create a new JavaScript file in this directory (e.g., `userSignups.js`)
2. Define your metric using one of the template structures
3. Run `npm run export-queries` to update the API with your new query

Your metric will be automatically detected and added to the dashboard without modifying any other files.

## Metric Types

The dashboard supports three types of metrics:

1. **Simple Metrics**: Basic time series with date and value columns
2. **Multi-Series Metrics**: Date with multiple value columns, each becoming a separate series
3. **Label-Based Metrics**: Time series with date, value, and label columns, where data points with the same label are grouped into separate lines

## Metric Definition Structure

Each metric file should export a default object with the following structure:

```javascript
const myMetric = {
  id: 'uniqueMetricId',            // Unique identifier (required)
  name: 'Display Name',            // Name shown in the UI (required)
  description: 'Description',      // Subtitle text (optional)
  format: 'formatNumber',          // Value formatter (optional)
  chartType: 'line',               // Chart type: line, bar, stackedBar (optional)
  color: '#4285F4',                // Color or array of colors (optional)
  
  // For label-based metrics only:
  labelField: 'client',            // Column containing label values
  valueField: 'value',             // Column containing numeric values (default: 'value')
  
  // ClickHouse query (required)
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

export default myMetric;
```

## Query Format Requirements

For proper visualization, your query should return data in one of these formats:

### 1. Simple Time Series (date + value)

```sql
SELECT 
  toDate(event_time) AS date, 
  count() AS value
FROM your_table
WHERE ...
GROUP BY date
ORDER BY date
```

### 2. Multi-Series Data (columns become separate lines)

```sql
SELECT 
  toStartOfHour(created_at) AS hour,
  SUM(if(client='Lighthouse',1,0)) AS Lighthouse,
  SUM(if(client='Teku',1,0)) AS Teku,
  SUM(if(client='Lodestar',1,0)) AS Lodestar
FROM your_table
WHERE ...
GROUP BY hour
ORDER BY hour
```

### 3. Label-Based Data (rows grouped by label)

```sql
SELECT 
  toDate(event_time) AS date,
  client_name AS client,
  avg(query_duration_ms) / 1000 AS value
FROM system.query_log
WHERE ...
GROUP BY date, client
ORDER BY date, client
```

## Colors

Colors can be specified in three ways:

1. **Single Color**: For simple metrics, specify a single hex color (`color: '#4285F4'`)
2. **Color Array**: For multi-series metrics, specify an array of colors (`color: ['#4285F4', '#34A853', ...]`)
3. **Auto-generated**: If not specified or if more colors are needed than provided, the system will generate additional colors automatically

## Date Field Naming

The system automatically detects these date-related fields:
- `date` - For daily data
- `hour` - For hourly data
- `timestamp`, `time`, `day` - Alternative date fields

## Example Files

- See `metric-template.js.example` for a simple metric template
- See `labeled-metric-template.js.example` for a label-based metric template