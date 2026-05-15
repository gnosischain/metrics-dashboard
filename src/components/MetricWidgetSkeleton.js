import React from 'react';

// Unified circular-spinner loading state. Variant is kept for API-compatibility
// (callers pass 'number' | 'text' | 'table' | 'chart') and only affects the
// minimum height of the wrapper so KPIs don't reflow when data lands.
const MIN_HEIGHT_BY_VARIANT = {
  number: 84,
  text: 120,
  table: 160,
  chart: 200,
};

const MetricWidgetSkeleton = ({ variant = 'chart' }) => {
  const minHeight = MIN_HEIGHT_BY_VARIANT[variant] || MIN_HEIGHT_BY_VARIANT.chart;
  return (
    <div
      className={`metric-skeleton metric-skeleton-${variant}`}
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: `${minHeight}px`,
        width: '100%',
      }}
    >
      <div className="loading-indicator" aria-hidden="true">
        <div className="loading-spinner" />
      </div>
    </div>
  );
};

export default MetricWidgetSkeleton;
