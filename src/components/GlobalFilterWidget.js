import React from 'react';
import LabelSelector from './LabelSelector';

/**
 * GlobalFilterWidget - renders the global filter dropdown and unit toggle
 * as a grid-positioned card, rather than a fixed header above the grid.
 *
 * @param {Object} props
 * @param {Object} props.tabConfig - Tab configuration (globalFilterField, unitToggle, etc.)
 * @param {Array}  props.globalFilterOptions - Available filter values
 * @param {string} props.globalFilterValue - Currently selected filter value
 * @param {Function} props.onGlobalFilterChange - Handler for filter changes
 * @param {boolean} props.loadingGlobalFilter - Whether options are still loading
 * @param {boolean} props.hasUnitToggle - Whether to show Native/USD toggle
 * @param {string} props.selectedUnit - Currently selected unit ('native' or 'usd')
 * @param {Function} props.onUnitChange - Handler for unit toggle
 */
const GlobalFilterWidget = ({
  tabConfig,
  globalFilterOptions,
  globalFilterValue,
  onGlobalFilterChange,
  loadingGlobalFilter,
  hasUnitToggle,
  selectedUnit,
  onUnitChange,
}) => {
  const fieldName = tabConfig?.globalFilterField || '';
  const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

  return (
    <div className="global-filter-widget">
      <div className="global-filter-widget-content">
        {/* Filter dropdown */}
        {fieldName && onGlobalFilterChange && (
          <div className="global-filter-widget-group">
            <label className="global-filter-label" htmlFor="global-filter-select">
              {label}:
            </label>
            <div className="global-filter-selector">
              {loadingGlobalFilter ? (
                <div className="global-filter-loading">
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0 }}></div>
                </div>
              ) : globalFilterOptions.length > 0 ? (
                <LabelSelector
                  labels={globalFilterOptions}
                  selectedLabel={globalFilterValue || globalFilterOptions[0] || ''}
                  onSelectLabel={onGlobalFilterChange}
                  labelField={fieldName}
                  idPrefix="global-filter"
                />
              ) : (
                <div className="global-filter-error">No options available</div>
              )}
            </div>
          </div>
        )}

        {/* Unit toggle */}
        {hasUnitToggle && (
          <div className="unit-toggle-container">
            <div className="unit-toggle-buttons">
              <button
                className={`unit-toggle-btn ${selectedUnit === 'native' ? 'active' : ''}`}
                onClick={() => onUnitChange('native')}
              >
                Native
              </button>
              <button
                className={`unit-toggle-btn ${selectedUnit === 'usd' ? 'active' : ''}`}
                onClick={() => onUnitChange('usd')}
              >
                USD
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalFilterWidget;
