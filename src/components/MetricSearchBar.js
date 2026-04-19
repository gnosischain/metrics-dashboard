import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import IconComponent from './IconComponent';
import { searchMetricIndex } from '../utils/metricSearch';

const RESULT_LIMIT = 8;

const normalizeCollisionKey = (value = '') => String(value).trim().toLowerCase();

const buildDuplicateCollisionMap = (entries = []) => {
  const collisionCounts = new Map();

  entries.forEach((entry) => {
    const key = [
      normalizeCollisionKey(entry.metricName),
      normalizeCollisionKey(entry.dashboardName),
      normalizeCollisionKey(entry.tabName)
    ].join('::');

    collisionCounts.set(key, (collisionCounts.get(key) || 0) + 1);
  });

  return collisionCounts;
};

const getDuplicateQualifier = (entry) => {
  const description = typeof entry.description === 'string' ? entry.description.trim() : '';
  const metricDescription = typeof entry.metricDescription === 'string' ? entry.metricDescription.trim() : '';

  if (description) {
    return description;
  }

  if (metricDescription) {
    return metricDescription;
  }

  return entry.metricId;
};

const MetricSearchBar = ({ searchIndex = [], onSelect, searchEnabled = true, sectors = [] }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();

  const trimmedQuery = query.trim();
  const results = useMemo(() => {
    if (!searchEnabled || !trimmedQuery) {
      return [];
    }
    return searchMetricIndex(searchIndex, trimmedQuery, { limit: RESULT_LIMIT });
  }, [searchEnabled, searchIndex, trimmedQuery]);

  const duplicateCollisionMap = useMemo(() => buildDuplicateCollisionMap(results), [results]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveResultIndex(-1);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setActiveResultIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!results.length) {
      setActiveResultIndex(-1);
      return;
    }

    if (activeResultIndex < 0 || activeResultIndex >= results.length) {
      setActiveResultIndex(0);
    }
  }, [results, activeResultIndex]);

  const handleSelect = (entry) => {
    if (!entry || typeof onSelect !== 'function') return;

    onSelect(entry);
    setQuery('');
    setIsOpen(false);
    setActiveResultIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSectorSelect = (sector) => {
    if (!sector || typeof onSelect !== 'function') return;
    onSelect({ dashboardId: sector.id, tabId: null });
    setQuery('');
    setIsOpen(false);
    setActiveResultIndex(-1);
    inputRef.current?.blur();
  };

  const showSectorMenu = isOpen && !trimmedQuery && sectors.length > 0;
  const showResultsMenu = isOpen && !!trimmedQuery;

  const handleKeyDown = (event) => {
    if (!searchEnabled) return;

    if (event.key === 'ArrowDown') {
      if (!results.length) return;
      event.preventDefault();
      setIsOpen(true);
      setActiveResultIndex((previous) => {
        if (previous < 0) return 0;
        return (previous + 1) % results.length;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      if (!results.length) return;
      event.preventDefault();
      setIsOpen(true);
      setActiveResultIndex((previous) => {
        if (previous < 0) return results.length - 1;
        return (previous - 1 + results.length) % results.length;
      });
      return;
    }

    if (event.key === 'Enter' && isOpen && results.length) {
      event.preventDefault();
      const selectedEntry = results[activeResultIndex] || results[0];
      handleSelect(selectedEntry);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveResultIndex(-1);
    }
  };

  return (
    <div className="metric-search" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="search"
        className="metric-search-input"
        placeholder="Search metrics, tabs, dashboards..."
        aria-label="Search metrics"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        disabled={!searchEnabled}
      />

      {showSectorMenu && (
        <div className="metric-search-menu metric-search-menu--sectors" role="menu">
          <div className="metric-search-menu-head">Jump to sector</div>
          <div className="metric-search-sector-grid">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                type="button"
                role="menuitem"
                className="metric-search-sector"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSectorSelect(sector)}
              >
                <span className="metric-search-sector-icon" aria-hidden="true">
                  {sector.iconClass
                    ? <IconComponent name={sector.iconClass} size="md" />
                    : (sector.icon || <IconComponent name="chart-line" size="md" />)}
                </span>
                <span className="metric-search-sector-name">{sector.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showResultsMenu && (
        <div id={listboxId} className="metric-search-menu" role="listbox">
          {results.length > 0 ? (
            results.map((entry, index) => {
              const isActive = index === activeResultIndex;
              const collisionKey = [
                normalizeCollisionKey(entry.metricName),
                normalizeCollisionKey(entry.dashboardName),
                normalizeCollisionKey(entry.tabName)
              ].join('::');
              const hasDuplicateTitlePath = (duplicateCollisionMap.get(collisionKey) || 0) > 1;
              const titleText = hasDuplicateTitlePath
                ? `${entry.metricName} (${getDuplicateQualifier(entry)})`
                : entry.metricName;

              return (
                <button
                  key={entry.key}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`metric-search-item ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setActiveResultIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(entry)}
                >
                  <span className="metric-search-item-body">
                    <span className="metric-search-title">{titleText}</span>
                    <span className="metric-search-path">{entry.tabName}</span>
                  </span>
                  <span className="metric-search-sector-chip" aria-label={`Sector: ${entry.dashboardName}`}>
                    <span className="metric-search-sector-chip-icon" aria-hidden="true">
                      {entry.dashboardIconClass
                        ? <IconComponent name={entry.dashboardIconClass} size="sm" />
                        : (entry.dashboardIcon || <IconComponent name="chart-line" size="sm" />)}
                    </span>
                    <span className="metric-search-sector-chip-name">{entry.dashboardName}</span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="metric-search-empty">No matching metrics</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricSearchBar;
