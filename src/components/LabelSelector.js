import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * LabelSelector component – custom scrollable dropdown for filtering by label.
 * Shows a maximum of 5 visible items at a time; the rest are accessible by scrolling.
 * Supports keyboard navigation (ArrowUp/Down, Enter, Escape).
 *
 * @param {Object}   props
 * @param {Array}    props.labels          - Available label values
 * @param {string}   props.selectedLabel   - Currently selected label
 * @param {Function} props.onSelectLabel   - Selection handler
 * @param {string}   props.labelField      - Field name (for display, unused currently)
 * @param {string}   props.idPrefix        - Unique prefix for element IDs
 */
const LabelSelector = ({ labels, selectedLabel, onSelectLabel, labelField = 'label', idPrefix }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const lastInteractionRef = useRef('pointer');

  const selectedIndex = labels ? labels.indexOf(selectedLabel) : -1;

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  // Close on click outside
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

  // Scroll focused item into view
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || !listRef.current) return;
    if (lastInteractionRef.current !== 'keyboard') return;
    const item = listRef.current.children[focusedIndex];
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  if (!labels || labels.length === 0) {
    return null;
  }

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      lastInteractionRef.current = 'pointer';
      setIsOpen(true);
      // Pre-focus the currently selected item
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
        setFocusedIndex(prev => (prev < labels.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        lastInteractionRef.current = 'keyboard';
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        lastInteractionRef.current = 'keyboard';
        if (focusedIndex >= 0 && focusedIndex < labels.length) {
          selectItem(labels[focusedIndex]);
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

  return (
    <div
      className="label-selector title-level"
      ref={containerRef}
    >
      <div className="custom-dropdown" id={selectId}>
        {/* Trigger button – styled to look like the native select */}
        <button
          type="button"
          className={`custom-dropdown-trigger label-selector-dropdown${isOpen ? ' open' : ''}`}
          onClick={toggle}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="custom-dropdown-value">{selectedLabel || ''}</span>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <ul
            ref={listRef}
            className="custom-dropdown-list"
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined
            }
          >
            {labels.map((label, index) => (
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
      </div>
    </div>
  );
};

export default LabelSelector;
