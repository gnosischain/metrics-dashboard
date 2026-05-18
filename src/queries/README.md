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
  metricDescription: 'More detail',// Markdown shown in info popover (optional)
  format: 'formatNumber',          // Value formatter (optional)
  chartType: 'line',               // Chart type: line, bar, stackedBar (optional)
  color: '#4285F4',                // Color or array of colors (optional)
  enableFiltering: true,           // Enables dropdown filtering (optional)
  enableZoom: true,                // Enables per-widget time-range buttons when no tab range is active
  defaultZoom: { start: 80, end: 100 }, // Initial ECharts viewport only
  isTimeSeries: true,              // Hint for time-series behavior
  xField: 'date',                  // X-axis field (defaults to detected date/category fields)
  yField: 'value',                 // Primary numeric field (defaults to value)
  
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

Common authoring fields used across the current dashboards:

- `metricDescription`: markdown content for the info popover.
- `enableFiltering`: shows a local dropdown when the widget has a `labelField` or `localFilterFields`.
- `labelField`: the primary filter field for local/global dropdown behavior.
- `localFilterFields`: advanced multi-dropdown widgets, for example `['window', 'symbol']`.
- `enableZoom`: enables local range buttons (`1M / 3M / 6M / 1Y / 2Y / ALL`) when the tab does not already provide a global range.
- `defaultZoom`: initial chart viewport. This is ignored while a time-range button is actively filtering data.
- `resolutions`, `defaultResolution`: enable D/W/M resolution switching across sibling metrics.
- `unitFilterField`: server-side secondary filter field used by a `Native / USD` toggle.
- `unitFields`: map of unit keys to field-level display settings, for example native vs USD values.
- `unitFieldGroups`: advanced grouped unit toggles for multi-part controls.
- `changeData`: config for number-card delta badges.
- `showTotal`, `stacked`, `seriesField`, `valueModeConfig`, `tableConfig`: chart/widget-specific options used throughout the existing dashboards.

## Dashboard Integration Fields

Metrics become visible only after they are placed in dashboard YAML. The tab config determines which controls are shared across that tab.

Tab-level fields used today:

- `globalFilterField`: shared filter field for the tab.
- `globalFilterLabel`: optional display label for the global filter.
- `globalControlsPlacement`: `grid` or `top`.
- `unitToggle`, `defaultUnit`: shared `Native / USD` control.
- `timeRanges`, `defaultTimeRange`: shared date-range controls.
- `resolutionToggle`, `defaultResolution`: shared resolution controls.
- `searchable`, `searchPlaceholder`: searchable global filter input for long option lists.

Historical note:

- `global_filter` is a pseudo-metric used only for in-grid placement of tab-level controls.
- For newer tabs, `globalControlsPlacement: top` moves the same global controls into the top toolbar next to `Date range`.

## Global Filters and Local Filters

Global filters and local filters work together, but they are not the same thing.

1. Tab-level global filter
   - Defined in dashboard YAML with `globalFilterField`.
   - `MetricGrid` fetches the available options once from a suitable metric and reuses them across the tab.
   - A metric participates automatically when `enableFiltering: true` and its `labelField` matches the tab `globalFilterField`.
   - A metric can also opt in explicitly with `globalFilterField` in the metric config when its displayed `labelField` is different.

2. Widget-level local filter
   - Comes from `enableFiltering` plus `labelField` or `localFilterFields`.
   - Still appears when the widget has a secondary field that is different from the tab’s global filter.
   - Local filter options are derived from the widget’s data after the active global filter is applied.

3. Server-side filtering
   - When a global filter is active, `MetricWidget` passes `filterField=<globalFilterField>` and the selected value to the API request.
   - When a unit toggle is active and the metric uses `unitFilterField`, `MetricWidget` also passes `filterField2=<unitFilterField>`.

## Time Range Behavior

Time ranges now filter data before rendering instead of forcing an ECharts percentage zoom.

- Tab-level ranges come from YAML `timeRanges`.
- Widget-level ranges come from metric `enableZoom`.
- When a tab-level range is active, local range buttons are hidden for that widget.
- `filterDataByTimeRange()` trims the data array before it reaches charts, number cards, tables, and change calculations.
- `ALL` returns the full dataset.
- `defaultZoom` still controls the initial visual viewport when no active time-range filter is applied.

This means time-range selection affects:

- chart series
- number-card values
- delta/change calculations
- table rows
- dynamic unit labels derived from the filtered dataset

## Units and Native / USD Toggles

There are two common patterns for unit switching:

1. Server-side unit filtering with `unitFilterField`

```javascript
const metric = {
  enableFiltering: true,
  labelField: 'token',
  unitFilterField: 'cohort_unit',
  yField: 'value',
};
```

This is used when the API returns one value column and the chosen unit is another filter dimension.

2. Field switching with `unitFields`

```javascript
const metric = {
  yField: 'value_native',
  unitFields: {
    native: { field: 'value_native', format: 'formatNumber', label: 'Native' },
    usd: { field: 'value_usd', format: 'formatCurrency', label: 'USD' }
  }
};
```

Guidance:

- Prefer explicit `label` values in `unitFields` when you want stable button text.
- If no explicit label is provided, the UI falls back to canonical labels for common keys such as `native -> Native` and `usd -> USD`.
- If you use `labelField` inside a `unitFields` entry, the button/axis label can be derived dynamically from the filtered data, for example pool token symbols.
- Tab-level `unitToggle: true` suppresses simple local `Native / USD` toggles on affected widgets and passes the shared selection down instead.

## Token Symbols and Icons

Token-aware dropdowns are opt-in by field name.

- Local dropdowns automatically show token icons when `labelField === 'token'`.
- Multi-local dropdowns also show token icons when the specific filter field name is `token`.
- Global filters show token icons when the tab `globalFilterField` is `token`.
- Icons are resolved from `src/utils/tokenIcons.js`.
- Symbol lookup is case-insensitive, so inputs like `usdc.e` can still resolve to the canonical `USDC.e` icon.

Important limitation:

- If your metric uses `labelField: 'label'` and that field happens to contain token symbols, the UI will not infer token icons automatically.
- If token icons are expected, prefer `labelField: 'token'` and return a `token` column from the query.

## Recommended Patterns

### Token-filtered tab metric

```javascript
const metric = {
  id: 'api_execution_tokens_balance_cohorts_value_daily',
  name: 'Value',
  chartType: 'area',
  isTimeSeries: true,
  enableFiltering: true,
  enableZoom: true,
  labelField: 'token',
  unitFilterField: 'cohort_unit',
  xField: 'date',
  yField: 'value_native',
  unitFields: {
    native: { field: 'value_native', format: 'formatNumber', label: 'Native' },
    usd: { field: 'value_usd', format: 'formatCurrency', label: 'USD' }
  },
  query: `
    SELECT date, token, cohort_unit, label, value_native, value_usd
    FROM dbt.api_execution_tokens_balance_cohorts_value_daily
  `
};
```

### Matching dashboard tab config

```yaml
- name: Per-token breakdown
  globalFilterField: token
  globalControlsPlacement: top
  unitToggle: true
  defaultUnit: native
  timeRanges: true
  metrics:
    - id: api_execution_tokens_balance_cohorts_value_daily
      gridRow: 2
      gridColumn: 1 / span 6
      minHeight: 450px
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
