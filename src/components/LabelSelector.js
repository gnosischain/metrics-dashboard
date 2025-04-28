import React from 'react';

/**
 * LabelSelector component for filtering chart data by label (No "All" option)
 * @param {Object} props - Component props
 * @param {Array} props.labels - Available label values to select from
 * @param {string} props.selectedLabel - Currently selected label
 * @param {Function} props.onSelectLabel - Handler for label selection change
 * @param {string} props.labelField - Name of the field being filtered (for display)
 * @param {string} props.idPrefix - Unique prefix for element IDs
 * @returns {JSX.Element|null} Label selector component or null
 */
const LabelSelector = ({ labels, selectedLabel, onSelectLabel, labelField = 'label', idPrefix }) => {

  if (!labels || labels.length === 0) {
    // Don't render if no labels or only one label (no choice needed)
    return null;
  }

  // Capitalize labelField for display
  const displayLabel = labelField.charAt(0).toUpperCase() + labelField.slice(1);
  const selectId = `${idPrefix}-label-selector`;

  return (
    <div className="label-selector title-level"> {/* Add class for styling */}
      <label className="label-selector-label" htmlFor={selectId}>
        {displayLabel}:&nbsp; {/* Simplified label */}
      </label>
      <select
        id={selectId}
        value={selectedLabel} // Should always have a value now
        onChange={(e) => onSelectLabel(e.target.value)}
        className="label-selector-dropdown"
      >
        {/* Removed the "All" option */}
        {/* Render options for each unique label */}
        {labels.map(label => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LabelSelector;