import React from 'react';
import formatters from '../utils/formatters';

const normalizeDurationLabel = (value) => {
  if (typeof value !== 'string') return '';
  const trimmedValue = value.trim();
  const dayMatch = trimmedValue.match(/^(\d+)\s*d(?:ays?)?$/i);
  if (dayMatch) {
    return `${dayMatch[1]} days`;
  }
  return trimmedValue;
};

const normalizeChangePeriod = (value = '') => {
  if (typeof value !== 'string') return [];

  const trimmedValue = value.trim();
  if (!trimmedValue) return [];

  const versusPriorMatch = trimmedValue.match(/^vs prior\s+(.+)$/i);
  if (versusPriorMatch) {
    return ['vs prior', normalizeDurationLabel(versusPriorMatch[1])];
  }

  const symmetricWindowMatch = trimmedValue.match(/^(\d+)\s*d(?:ays?)?\s+vs prior\s+(\d+)\s*d(?:ays?)?$/i);
  if (symmetricWindowMatch && symmetricWindowMatch[1] === symmetricWindowMatch[2]) {
    return ['vs prior', `${symmetricWindowMatch[1]} days`];
  }

  return [trimmedValue];
};

/**
 * Component to display a metric as a large number with optional change indicators
 * @param {Object} props - Component props
 * @param {number|string} props.value - The value to display
 * @param {string} props.format - The format to apply (e.g., formatNumber, formatBytes)
 * @param {string} props.color - Color for the value
 * @param {string} props.label - Label for the value
 * @param {boolean} props.isDarkMode - Whether dark mode is active
 * @param {string} props.variant - Layout variant: 'default' or 'compact'
 * @param {number|string} props.changeValue - Change value (percentage or absolute)
 * @param {string} props.changeType - Type of change: 'positive', 'negative', or 'neutral'
 * @param {boolean} props.showChange - Whether to show change indicator
 * @param {string} props.changePeriod - Period for the change (e.g., '30d ago', 'from last month')
 * @param {Object|null} props.dashboardPalette - Dashboard-level palette overrides
 * @returns {JSX.Element} Number widget component
 */
/**
 * Build an inline SVG sparkline path (~100×28) from an array of numeric values.
 * Normalised so min=bottom and max=top within the viewBox.
 */
const buildSparklinePaths = (values, width = 120, height = 32) => {
  if (!Array.isArray(values) || values.length < 2) return null;
  const nums = values.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v)))
    .filter((n) => Number.isFinite(n));
  if (nums.length < 2) return null;

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const stepX = width / (nums.length - 1);

  const points = nums.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 2) - 1;
    return [x, y];
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L${width.toFixed(2)},${height.toFixed(2)} L0,${height.toFixed(2)} Z`;

  return { linePath, areaPath, width, height };
};

const NumberWidget = ({
  value,
  format = 'formatNumber',
  color = '#4F46E5',
  label,
  isDarkMode = false,
  variant = 'default',
  changeValue,
  changeType = 'neutral',
  showChange = false,
  changePeriod = '',
  fontSize,
  dashboardPalette = null,
  sparkline = null,
  linkTo = null,
  onLinkClick = null
}) => {
  // Apply formatting if specified
  const formattedValue = format && formatters[format] 
    ? formatters[format](value)
    : value;
    
  // Keep custom metric colors but map the default accent to the active theme.
  const normalizedColor = (color || '').toLowerCase();
  const isDefaultAccent =
    !normalizedColor ||
    normalizedColor === '#4f46e5' ||
    normalizedColor === '#6366f1' ||
    normalizedColor === '#0969da' ||
    normalizedColor === '#58a6ff';
  const adjustedColor = isDefaultAccent
    ? (
      (isDarkMode ? dashboardPalette?.numberAccentDark : dashboardPalette?.numberAccentLight) ||
      (isDarkMode ? '#818CF8' : '#4F46E5')
    )
    : color;

  // Format change value
  const formattedChange = React.useMemo(() => {
    if (!changeValue) return '';
    
    // If it's already a formatted string (like "+0.07%"), use as is
    if (typeof changeValue === 'string' && (changeValue.includes('%') || changeValue.includes('+'))) {
      return changeValue;
    }
    
    // Otherwise format as percentage
    const numericChange = parseFloat(changeValue);
    if (isNaN(numericChange)) return '';
    
    const sign = numericChange > 0 ? '+' : '';
    return `${sign}${numericChange.toFixed(2)}%`;
  }, [changeValue]);

  const changePeriodLines = React.useMemo(() => normalizeChangePeriod(changePeriod), [changePeriod]);

  // Determine arrow direction and colors
  const getChangeStyles = () => {
    const baseStyles = {
      fontSize: '0.75rem',
      fontWeight: '500',
      padding: '0.125rem 0.375rem',
      borderRadius: '0.25rem'
    };

    switch (changeType) {
      case 'positive':
        return {
          ...baseStyles,
          color: isDarkMode ? '#3FB950' : '#1a7f37',
          backgroundColor: isDarkMode ? 'rgba(63, 185, 80, 0.15)' : 'rgba(26, 127, 55, 0.1)'
        };
      case 'negative':
        return {
          ...baseStyles,
          color: isDarkMode ? '#F85149' : '#cf222e',
          backgroundColor: isDarkMode ? 'rgba(248, 81, 73, 0.15)' : 'rgba(207, 34, 46, 0.1)'
        };
      default:
        return {
          ...baseStyles,
          color: isDarkMode ? '#94A3B8' : '#64748B',
          backgroundColor: isDarkMode ? 'rgba(148, 163, 184, 0.14)' : 'rgba(100, 116, 139, 0.12)'
        };
    }
  };

  // Compact variant (horizontal layout)
  if (variant === 'compact') {
    return (
      <div className="number-widget number-widget-compact">
        <div className="compact-number-container">
          {/* Main content group */}
          <div className="compact-main-content">
            {/* Main number */}
            <span 
              className="compact-number-value" 
              style={{ 
                color: adjustedColor,
                ...(fontSize && { fontSize })
              }}
            >
              {formattedValue}
            </span>
            
            {/* Label */}
            {label && (
              <span className="compact-number-label">
                {label}
              </span>
            )}
          </div>
          
          {/* Change indicator */}
          {showChange && formattedChange && (
            <span className="compact-change-indicator" style={getChangeStyles()}>
              <span className="change-value">{formattedChange}</span>
              {changePeriodLines.length > 0 && (
                <span className="change-period">
                  {changePeriodLines.map((line, index) => (
                    <span key={`${line}-${index}`} className="change-period-line">{line}</span>
                  ))}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    );
  }

  // KPI variant — big number + delta chip + inline sparkline (Artemis-style tile)
  if (variant === 'kpi') {
    const sparkPaths = buildSparklinePaths(sparkline);
    const sparkStrokeColor = changeType === 'negative'
      ? (isDarkMode ? '#F85149' : '#cf222e')
      : changeType === 'positive'
      ? (isDarkMode ? '#3FB950' : '#1a7f37')
      : adjustedColor;

    const body = (
      <div className="kpi-tile">
        <div className="kpi-tile-top">
          <span
            className="kpi-tile-value"
            style={{
              color: adjustedColor,
              ...(fontSize && { fontSize })
            }}
          >
            {formattedValue}
          </span>
          {showChange && formattedChange && (
            <span className="kpi-tile-change" style={getChangeStyles()}>
              <span className="change-value">{formattedChange}</span>
              {changePeriodLines.length > 0 && (
                <span className="change-period">
                  {changePeriodLines.map((line, index) => (
                    <span key={`${line}-${index}`} className="change-period-line">{line}</span>
                  ))}
                </span>
              )}
            </span>
          )}
        </div>
        {sparkPaths && (
          <svg
            className="kpi-tile-sparkline"
            viewBox={`0 0 ${sparkPaths.width} ${sparkPaths.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d={sparkPaths.areaPath} fill={sparkStrokeColor} opacity={isDarkMode ? 0.18 : 0.12} />
            <path d={sparkPaths.linePath} fill="none" stroke={sparkStrokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {label && <div className="kpi-tile-label">{label}</div>}
      </div>
    );

    if (linkTo && typeof onLinkClick === 'function') {
      return (
        <button
          type="button"
          className="kpi-tile-link"
          onClick={() => onLinkClick(linkTo)}
          aria-label={`Open ${label || linkTo} dashboard`}
        >
          {body}
          <span className="kpi-tile-arrow" aria-hidden="true">→</span>
        </button>
      );
    }
    return body;
  }

  // Default variant
  return (
    <div className="number-widget">
      <div className="number-value-row">
        <div
          className="number-value"
          style={{
            color: adjustedColor,
            ...(fontSize && { fontSize })
          }}
        >
          {formattedValue}
        </div>
        {/* Change indicator inline with number */}
        {showChange && formattedChange && (
          <span className="number-change" style={getChangeStyles()}>
            <span className="change-value">{formattedChange}</span>
            {changePeriodLines.length > 0 && (
              <span className="change-period">
                {changePeriodLines.map((line, index) => (
                  <span key={`${line}-${index}`} className="change-period-line">{line}</span>
                ))}
              </span>
            )}
          </span>
        )}
      </div>
      {label && (
        <div
          className="number-label"
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default NumberWidget;
