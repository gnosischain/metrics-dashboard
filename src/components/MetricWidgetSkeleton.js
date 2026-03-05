import React from 'react';

const MetricWidgetSkeleton = ({ variant = 'chart' }) => {
  if (variant === 'number') {
    return (
      <div className="metric-skeleton metric-skeleton-number" aria-hidden="true">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-number-value"></div>
        <div className="skeleton skeleton-badge"></div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="metric-skeleton metric-skeleton-text" aria-hidden="true">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line"></div>
        <div className="skeleton skeleton-line skeleton-line-short"></div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="metric-skeleton metric-skeleton-table" aria-hidden="true">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-table-row"></div>
        <div className="skeleton skeleton-table-row"></div>
        <div className="skeleton skeleton-table-row"></div>
        <div className="skeleton skeleton-table-row skeleton-line-short"></div>
      </div>
    );
  }

  return (
    <div className="metric-skeleton metric-skeleton-chart" aria-hidden="true">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-chart"></div>
    </div>
  );
};

export default MetricWidgetSkeleton;
