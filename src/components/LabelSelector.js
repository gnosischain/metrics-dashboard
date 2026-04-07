import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * LabelSelector component – custom scrollable dropdown for filtering by label.
 * Shows a maximum of 5 visible items at a time; the rest are accessible by scrolling.
 * Supports keyboard navigation (ArrowUp/Down, Enter, Escape).
 * When `searchable` is true, renders a text input for filtering long lists (e.g. addresses).
 *
 * @param {Object}   props
 * @param {Array}    props.labels          - Available options. Either a string array
 *                                           OR an array of `{ label, value, sublabel? }`
 *                                           objects. Object form lets the display label
 *                                           differ from the value passed to onSelectLabel,
 *                                           and lets search match BOTH fields.
 * @param {string}   props.selectedLabel   - Currently selected value
 * @param {Function} props.onSelectLabel   - Selection handler (receives the value, not the label)
 * @param {string}   props.labelField      - Field name (for display, unused currently)
 * @param {string}   props.idPrefix        - Unique prefix for element IDs
 * @param {boolean}  props.searchable      - Enable search/filter input (default false)
 * @param {string}   props.placeholder     - Placeholder for the search input
 */
const LabelSelector = ({ labels, selectedLabel, onSelectLabel, labelField = 'label', idPrefix, searchable = false, placeholder = '', iconMap = null, formatLabel = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const lastInteractionRef = useRef('pointer');

  const MAX_VISIBLE = 50;

  // Normalize labels to a uniform `{ label, value, sublabel }` shape so the rest
  // of the component does not have to branch on string vs object input.
  const normalizedOptions = useMemo(() => {
    return (labels || []).map((entry) => {
      if (entry && typeof entry === 'object') {
        const value = entry.value != null ? String(entry.value) : '';
        const label = entry.label != null && entry.label !== ''
          ? String(entry.label)
          : value;
        const sublabel = entry.sublabel != null ? String(entry.sublabel) : '';
        return { label, value, sublabel };
      }
      const v = entry == null ? '' : String(entry);
      return { label: v, value: v, sublabel: '' };
    });
  }, [labels]);

  const matches = useCallback((opt, lower) => {
    if (!lower) return true;
    return (
      (opt.label && opt.label.toLowerCase().includes(lower)) ||
      (opt.value && opt.value.toLowerCase().includes(lower)) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(lower))
    );
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchable) return normalizedOptions;
    if (!searchText) return normalizedOptions.slice(0, MAX_VISIBLE);
    const lower = searchText.toLowerCase();
    return normalizedOptions.filter((o) => matches(o, lower)).slice(0, MAX_VISIBLE);
  }, [normalizedOptions, searchText, searchable, matches]);

  // Backwards-compatible alias used by parts of the file that still use
  // the old `filteredLabels` variable name.
  const filteredLabels = filteredOptions;

  const totalMatches = useMemo(() => {
    if (!searchable) return normalizedOptions.length;
    if (!searchText) return normalizedOptions.length;
    const lower = searchText.toLowerCase();
    return normalizedOptions.filter((o) => matches(o, lower)).length;
  }, [normalizedOptions, searchText, searchable, matches]);

  const selectedIndex = filteredOptions
    ? filteredOptions.findIndex((o) => o.value === selectedLabel)
    : -1;

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

  if ((!normalizedOptions || normalizedOptions.length === 0) && !searchable) {
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

  // Accepts either a normalized option object OR a raw value (used by the
  // freeform-paste path in the search input where the typed text is not in
  // the options list).
  const selectItem = (entry) => {
    lastInteractionRef.current = 'pointer';
    const value = entry && typeof entry === 'object' ? entry.value : entry;
    onSelectLabel(value);
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
        setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        lastInteractionRef.current = 'keyboard';
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        lastInteractionRef.current = 'keyboard';
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          selectItem(filteredOptions[focusedIndex]);
        } else if (searchable && searchText.trim()) {
          // Freeform mode: accept the typed value even if it's not in the options list.
          selectItem(searchText.trim());
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
  // Selected option lookup so we can show the display label (not the raw
  // value) in the trigger button.
  const selectedOption = useMemo(
    () => normalizedOptions.find((o) => o.value === selectedLabel),
    [normalizedOptions, selectedLabel]
  );
  const displayValue = (selectedOption ? selectedOption.label : selectedLabel) || placeholder || '';

  const renderLabel = (entry) => {
    // `entry` can be a normalized option object (from the option list) or
    // a raw string (the trigger button's display value).
    const isObject = entry && typeof entry === 'object';
    const labelText = isObject ? entry.label : entry;
    const valueText = isObject ? entry.value : entry;
    const sublabel  = isObject ? entry.sublabel : '';
    const displayText = formatLabel ? formatLabel(labelText) : labelText;
    const iconUrl = iconMap?.[valueText] || iconMap?.[labelText];
    const showSublabel = sublabel && sublabel !== labelText;
    const main = (
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {displayText}
      </span>
    );
    const meta = showSublabel
      ? <span style={{ marginLeft: 8, fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sublabel}</span>
      : null;
    if (!iconUrl) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {main}
          {meta}
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
        <img src={iconUrl} alt="" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        {main}
        {meta}
      </span>
    );
  };

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
          <span className="custom-dropdown-value">
            {renderLabel(selectedOption || displayValue)}
          </span>
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
            {filteredOptions.map((option, index) => (
              <li
                key={option.value || option.label || index}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={option.value === selectedLabel}
                className={
                  'custom-dropdown-item' +
                  (option.value === selectedLabel ? ' selected' : '') +
                  (index === focusedIndex ? ' focused' : '')
                }
                onClick={() => selectItem(option)}
              >
                {renderLabel(option)}
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
                placeholder={placeholder || 'Search...'}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {selectedLabel && (
              <div className="custom-dropdown-selected-badge">
                <span className="custom-dropdown-selected-value">
                  {renderLabel(selectedOption || selectedLabel)}
                </span>
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
              {filteredOptions.map((option, index) => (
                <li
                  key={option.value || option.label || index}
                  id={`${selectId}-option-${index}`}
                  role="option"
                  aria-selected={option.value === selectedLabel}
                  className={
                    'custom-dropdown-item' +
                    (option.value === selectedLabel ? ' selected' : '') +
                    (index === focusedIndex ? ' focused' : '')
                  }
                  onClick={() => selectItem(option)}
                >
                  {renderLabel(option)}
                </li>
              ))}
              {filteredOptions.length === 0 && (
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
