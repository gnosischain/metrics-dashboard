import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * LabelSelector component – custom scrollable dropdown for filtering by label.
 * Shows a maximum of 5 visible items at a time; the rest are accessible by scrolling.
 * Supports keyboard navigation (ArrowUp/Down, Enter, Escape).
 * When `searchable` is true, renders a text input for filtering long lists (e.g. addresses).
 *
 * @param {Object}   props
 * @param {Array}    props.labels          - Available label values
 * @param {string}   props.selectedLabel   - Currently selected label
 * @param {Function} props.onSelectLabel   - Selection handler
 * @param {string}   props.labelField      - Field name (for display, unused currently)
 * @param {string}   props.idPrefix        - Unique prefix for element IDs
 * @param {boolean}  props.searchable      - Enable search/filter input (default false)
 * @param {string}   props.placeholder     - Placeholder for the search input
 */
const LabelSelector = ({ labels, selectedLabel, onSelectLabel, labelField = 'label', idPrefix, searchable = false, placeholder = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const lastInteractionRef = useRef('pointer');

  const MAX_VISIBLE = 50;

  const filteredLabels = useMemo(() => {
    if (!searchable) return labels || [];
    if (!searchText) {
      return (labels || []).slice(0, MAX_VISIBLE);
    }
    const lower = searchText.toLowerCase();
    return (labels || []).filter(l => l.toLowerCase().includes(lower)).slice(0, MAX_VISIBLE);
  }, [labels, searchText, searchable]);

  const totalMatches = useMemo(() => {
    if (!searchable) return (labels || []).length;
    if (!searchText) return (labels || []).length;
    const lower = searchText.toLowerCase();
    return (labels || []).filter(l => l.toLowerCase().includes(lower)).length;
  }, [labels, searchText, searchable]);

  const selectedIndex = filteredLabels ? filteredLabels.indexOf(selectedLabel) : -1;

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setSearchText('');
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, close]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Scroll focused item into view
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || !listRef.current) return;
    if (lastInteractionRef.current !== 'keyboard') return;
    const item = listRef.current.children[focusedIndex];
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  // Reset focused index when search text changes
  useEffect(() => {
    setFocusedIndex(filteredLabels.length > 0 ? 0 : -1);
  }, [searchText, filteredLabels.length]);

  if (!labels || labels.length === 0) {
    return null;
  }

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      lastInteractionRef.current = 'pointer';
      setIsOpen(true);
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  };

  const selectItem = (label) => {
    lastInteractionRef.current = 'pointer';
    onSelectLabel(label);
    close();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        lastInteractionRef.current = 'keyboard';
        setFocusedIndex(prev => (prev < filteredLabels.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        lastInteractionRef.current = 'keyboard';
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        lastInteractionRef.current = 'keyboard';
        if (focusedIndex >= 0 && focusedIndex < filteredLabels.length) {
          selectItem(filteredLabels[focusedIndex]);
        }
        break;
      case 'Escape':
      case 'Tab':
        e.preventDefault();
        close();
        break;
      default:
        break;
    }
  };

  const selectId = `${idPrefix}-label-selector`;
  const displayValue = selectedLabel || placeholder || '';

  return (
    <div
      className="label-selector title-level"
      ref={containerRef}
    >
      <div className="custom-dropdown" id={selectId}>
        <button
          type="button"
          className={`custom-dropdown-trigger label-selector-dropdown${isOpen ? ' open' : ''}${searchable ? ' searchable' : ''}`}
          onClick={toggle}
          onKeyDown={!searchable ? handleKeyDown : undefined}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="custom-dropdown-value">{displayValue}</span>
        </button>

        {isOpen && !searchable && (
          <ul
            ref={listRef}
            className="custom-dropdown-list"
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined
            }
          >
            {filteredLabels.map((label, index) => (
              <li
                key={label}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={label === selectedLabel}
                className={
                  'custom-dropdown-item' +
                  (label === selectedLabel ? ' selected' : '') +
                  (index === focusedIndex ? ' focused' : '')
                }
                onClick={() => selectItem(label)}
              >
                {label}
              </li>
            ))}
          </ul>
        )}

        {isOpen && searchable && (
          <div className="custom-dropdown-panel searchable-panel">
            <div className="custom-dropdown-search">
              <input
                ref={searchInputRef}
                type="text"
                className="custom-dropdown-search-input"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {selectedLabel && (
              <div className="custom-dropdown-selected-badge">
                <span>Selected</span>
                <span className="custom-dropdown-selected-value">{selectedLabel}</span>
              </div>
            )}
            <ul
              ref={listRef}
              className="custom-dropdown-list"
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={
                focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined
              }
            >
              {filteredLabels.map((label, index) => (
                <li
                  key={label}
                  id={`${selectId}-option-${index}`}
                  role="option"
                  aria-selected={label === selectedLabel}
                  className={
                    'custom-dropdown-item' +
                    (label === selectedLabel ? ' selected' : '') +
                    (index === focusedIndex ? ' focused' : '')
                  }
                  onClick={() => selectItem(label)}
                >
                  {label}
                </li>
              ))}
              {filteredLabels.length === 0 && (
                <li className="custom-dropdown-item no-results">No matches</li>
              )}
              {totalMatches > MAX_VISIBLE && (
                <li className="custom-dropdown-item no-results">
                  {totalMatches - MAX_VISIBLE} more — refine your search
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelSelector;
