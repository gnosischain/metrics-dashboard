import React from 'react';
import LabelSelector from './LabelSelector';
import TOKEN_ICON_URLS, { formatTokenSymbol } from '../utils/tokenIcons.js';

const getOptionValue = (option) => {
  if (option && typeof option === 'object') {
    return option.value || '';
  }
  return option || '';
};

/**
 * GlobalFilterWidget - renders the shared global filter dropdown and unit toggle
 * either as an in-grid control card or as part of the top toolbar.
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
 * @param {string} props.placement - Control placement ('grid' or 'top')
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
  placement = 'grid'
}) => {
  const fieldName = tabConfig?.globalFilterField || '';
  const label = tabConfig?.globalFilterLabel || (fieldName.charAt(0).toUpperCase() + fieldName.slice(1));
  const isVertical = placement === 'grid' && tabConfig?.globalFilterVertical;
  const fallbackFilterValue = !tabConfig?.requireExplicitFilter && globalFilterOptions.length > 0
    ? getOptionValue(globalFilterOptions[0])
    : '';

  return (
    <div className={`global-filter-widget global-filter-widget--${placement}`}>
      <div className="global-filter-widget-content">
        {/* Filter dropdown */}
        {fieldName && onGlobalFilterChange && (
          <div className={`global-filter-widget-group${isVertical ? ' vertical' : ''}`}>
            <label className="global-filter-label" htmlFor="global-filter-select">
              {label}:
            </label>
            <div className="global-filter-selector">
              {loadingGlobalFilter ? (
                <div className="global-filter-loading">
                  <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0 }}></div>
                </div>
              ) : (globalFilterOptions.length > 0 || tabConfig?.searchable) ? (
                <LabelSelector
                  labels={globalFilterOptions}
                  selectedLabel={globalFilterValue || fallbackFilterValue}
                  onSelectLabel={onGlobalFilterChange}
                  labelField={fieldName}
                  idPrefix="global-filter"
                  searchable={!!tabConfig?.searchable}
                  placeholder={tabConfig?.searchPlaceholder || ''}
                  iconMap={fieldName === 'token' ? TOKEN_ICON_URLS : null}
                  formatLabel={fieldName === 'token' ? formatTokenSymbol : null}
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
