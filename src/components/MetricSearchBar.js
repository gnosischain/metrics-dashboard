import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
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

const MetricSearchBar = ({ searchIndex = [], onSelect, searchEnabled = true }) => {
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
    setIsOpen(Boolean(nextQuery.trim()));
  };

  const handleInputFocus = () => {
    if (trimmedQuery) {
      setIsOpen(true);
    }
  };

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

      {isOpen && trimmedQuery && (
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
                  <span className="metric-search-title">{titleText}</span>
                  <span className="metric-search-path">{entry.dashboardName} / {entry.tabName}</span>
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
